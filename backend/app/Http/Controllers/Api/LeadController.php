<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller {
    public function index() {
        return response()->json(["data" => DB::select("
            SELECT L.Person_ID,P.Person_Name,P.Email,P.Phone,P.Address,
                   L.Campaign_ID,L.Rep_ID,L.Stage_ID,L.Lead_Source,L.Date_Captured,L.Status,
                   PS.Stage_Name,C.Campaign_Name,C.Campaign_Type,
                   REP.Person_Name AS Rep_Name,SR.Employee_ID
            FROM LEADS L
            JOIN PERSON P          ON L.Person_ID=P.Person_ID
            JOIN PIPELINE_STAGE PS ON L.Stage_ID=PS.Stage_ID
            JOIN CAMPAIGN C        ON L.Campaign_ID=C.Campaign_ID
            LEFT JOIN SALES_REP SR ON L.Rep_ID=SR.Person_ID
            LEFT JOIN PERSON REP   ON SR.Person_ID=REP.Person_ID
            ORDER BY L.Date_Captured DESC")]);
    }
    public function show($id) {
        $r = DB::select("SELECT L.*,P.Person_Name,P.Email,PS.Stage_Name,C.Campaign_Name,REP.Person_Name AS Rep_Name FROM LEADS L JOIN PERSON P ON L.Person_ID=P.Person_ID JOIN PIPELINE_STAGE PS ON L.Stage_ID=PS.Stage_ID JOIN CAMPAIGN C ON L.Campaign_ID=C.Campaign_ID LEFT JOIN SALES_REP SR ON L.Rep_ID=SR.Person_ID LEFT JOIN PERSON REP ON SR.Person_ID=REP.Person_ID WHERE L.Person_ID=?",[$id]);
        return empty($r) ? response()->json(["error"=>"Not found"],404) : response()->json(["data"=>$r[0]]);
    }
    public function store(Request $request) {
        $request->validate(["Person_Name"=>"required","Email"=>"required|email|unique:PERSON,Email","Campaign_ID"=>"required","Stage_ID"=>"required"]);
        DB::beginTransaction();
        try {
            DB::table("PERSON")->insert(["Person_Name"=>$request->Person_Name,"Email"=>$request->Email,"Phone"=>$request->Phone??"","Address"=>$request->Address??"","Person_Type"=>"LEAD"]);
            $id = DB::getPdo()->lastInsertId();
            DB::table("LEADS")->insert(["Person_ID"=>$id,"Campaign_ID"=>$request->Campaign_ID,"Rep_ID"=>$request->Rep_ID,"Stage_ID"=>$request->Stage_ID,"Lead_Source"=>$request->Lead_Source??"","Date_Captured"=>$request->Date_Captured??now()->toDateString(),"Status"=>$request->Status??"New"]);
            DB::commit();
            return response()->json(["message"=>"Lead created","Person_ID"=>$id],201);
        } catch(\Exception $e){DB::rollBack();return response()->json(["error"=>$e->getMessage()],500);}
    }
    public function update(Request $request,$id) {
        DB::beginTransaction();
        try {
            if($request->hasAny(["Person_Name","Email","Phone","Address"])) DB::table("PERSON")->where("Person_ID",$id)->update($request->only(["Person_Name","Email","Phone","Address"]));
            if($request->hasAny(["Stage_ID","Status","Rep_ID","Lead_Source"])) DB::table("LEADS")->where("Person_ID",$id)->update($request->only(["Stage_ID","Status","Rep_ID","Lead_Source"]));
            DB::commit(); return response()->json(["message"=>"Updated"]);
        } catch(\Exception $e){DB::rollBack();return response()->json(["error"=>$e->getMessage()],500);}
    }
    public function destroy($id) {
        DB::beginTransaction();
        try {
            DB::table("CONTACT")->where("Lead_ID",$id)->delete();
            DB::table("CONVERSION_EVENT")->where("Lead_ID",$id)->delete();
            DB::table("LEADS")->where("Person_ID",$id)->delete();
            DB::table("PERSON")->where("Person_ID",$id)->delete();
            DB::commit(); return response()->json(["message"=>"Deleted"]);
        } catch(\Exception $e){DB::rollBack();return response()->json(["error"=>$e->getMessage()],500);}
    }
    public function convert($id) {
        $lead = DB::table("LEADS")->where("Person_ID",$id)->first();
        if(!$lead) return response()->json(["error"=>"Not found"],404);
        if(DB::table("CUSTOMER")->where("Person_ID",$id)->first()) return response()->json(["error"=>"Already customer"],409);
        DB::beginTransaction();
        try {
            $today=now()->toDateString();
            DB::table("CUSTOMER")->insert(["Person_ID"=>$id,"Conversion_Date"=>$today,"Total_Purchase_Value"=>0]);
            DB::table("PERSON")->where("Person_ID",$id)->update(["Person_Type"=>"CUSTOMER"]);
            DB::table("LEADS")->where("Person_ID",$id)->update(["Stage_ID"=>5,"Status"=>"Converted"]);
            DB::table("CONVERSION_EVENT")->insert(["Lead_ID"=>$id,"Customer_ID"=>$id,"Conversion_Date"=>$today,"Rep_ID"=>$lead->Rep_ID,"Notes"=>"Converted via CRM"]);
            DB::commit(); return response()->json(["message"=>"Converted","Customer_ID"=>$id]);
        } catch(\Exception $e){DB::rollBack();return response()->json(["error"=>$e->getMessage()],500);}
    }
}