<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class ResolutionController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT R.*,CO.Subject AS Complaint_Subject,P.Person_Name AS Rep_Name,CUST.Person_Name AS Customer_Name FROM RESOLUTION R JOIN COMPLAINT CO ON R.Complaint_ID=CO.Complaint_ID JOIN CUSTOMER C ON CO.Customer_ID=C.Person_ID JOIN PERSON CUST ON C.Person_ID=CUST.Person_ID LEFT JOIN SALES_REP SR ON R.Rep_ID=SR.Person_ID LEFT JOIN PERSON P ON SR.Person_ID=P.Person_ID ORDER BY R.Resolution_Date DESC")]);
    }
    public function store(Request $req){
        $req->validate(["Complaint_ID"=>"required","Resolution_Date"=>"required","Action_Taken"=>"required"]);
        $id=DB::table("RESOLUTION")->insertGetId(["Complaint_ID"=>$req->Complaint_ID,"Rep_ID"=>$req->Rep_ID,"Resolution_Date"=>$req->Resolution_Date,"Action_Taken"=>$req->Action_Taken,"Outcome"=>$req->Outcome??"Accepted"]);
        return response()->json(["message"=>"Saved","id"=>$id],201);
    }
}