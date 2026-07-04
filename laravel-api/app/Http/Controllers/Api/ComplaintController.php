<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ComplaintController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT CO.*,P.Person_Name AS Customer_Name FROM COMPLAINT CO JOIN CUSTOMER C ON CO.Customer_ID=C.Person_ID JOIN PERSON P ON C.Person_ID=P.Person_ID ORDER BY CO.Complaint_Date DESC")]);
    }
    public function store(Request $req){
        $req->validate(["Customer_ID"=>"required","Subject"=>"required"]);
        $id=DB::table("COMPLAINT")->insertGetId(["Customer_ID"=>$req->Customer_ID,"Complaint_Date"=>now()->toDateString(),"Subject"=>$req->Subject,"Description"=>$req->Description??"","Status"=>"In-Progress"]);
        return response()->json(["message"=>"Filed","id"=>$id],201);
    }
    public function resolve($id){DB::table("COMPLAINT")->where("Complaint_ID",$id)->update(["Status"=>"Resolved"]);return response()->json(["message"=>"Resolved"]);}
}