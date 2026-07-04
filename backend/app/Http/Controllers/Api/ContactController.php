<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ContactController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT C.*,P.Person_Name AS Lead_Name,P.Email AS Lead_Email,REP.Person_Name AS Rep_Name FROM CONTACT C JOIN LEADS L ON C.Lead_ID=L.Person_ID JOIN PERSON P ON L.Person_ID=P.Person_ID JOIN PERSON REP ON C.Rep_ID=REP.Person_ID ORDER BY C.Contact_Date DESC")]);
    }
    public function store(Request $req){
        $req->validate(["Lead_ID"=>"required","Rep_ID"=>"required","Contact_Type"=>"required"]);
        $id=DB::table("CONTACT")->insertGetId(["Lead_ID"=>$req->Lead_ID,"Rep_ID"=>$req->Rep_ID,"Contact_Date"=>now(),"Contact_Type"=>$req->Contact_Type,"Notes"=>$req->Notes??"","Next_Follow_Up"=>$req->Next_Follow_Up]);
        return response()->json(["message"=>"Logged","id"=>$id],201);
    }
    public function destroy($id){DB::table("CONTACT")->where("Contact_ID",$id)->delete();return response()->json(["message"=>"Deleted"]);}
}