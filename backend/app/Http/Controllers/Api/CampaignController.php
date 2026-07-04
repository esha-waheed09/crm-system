<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class CampaignController extends Controller {
    public function index() {
        return response()->json(["data"=>DB::select("SELECT C.*,COUNT(L.Person_ID) AS Total_Leads FROM CAMPAIGN C LEFT JOIN LEADS L ON L.Campaign_ID=C.Campaign_ID GROUP BY C.Campaign_ID,C.Campaign_Name,C.Campaign_Type,C.Start_Date,C.End_Date,C.Budget ORDER BY Total_Leads DESC")]);
    }
    public function show($id){return response()->json(["data"=>DB::table("CAMPAIGN")->find($id)]);}
    public function store(Request $req){
        $req->validate(["Campaign_Name"=>"required"]);
        $id=DB::table("CAMPAIGN")->insertGetId($req->only(["Campaign_Name","Campaign_Type","Start_Date","End_Date","Budget"]));
        return response()->json(["message"=>"Created","id"=>$id],201);
    }
    public function update(Request $req,$id){DB::table("CAMPAIGN")->where("Campaign_ID",$id)->update($req->only(["Campaign_Name","Campaign_Type","Start_Date","End_Date","Budget"]));return response()->json(["message"=>"Updated"]);}
    public function destroy($id){DB::table("CAMPAIGN")->where("Campaign_ID",$id)->delete();return response()->json(["message"=>"Deleted"]);}
}