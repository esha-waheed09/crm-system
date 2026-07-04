<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class FeedbackController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT F.*,P.Person_Name AS Customer_Name FROM FEEDBACK F JOIN CUSTOMER C ON F.Customer_ID=C.Person_ID JOIN PERSON P ON C.Person_ID=P.Person_ID ORDER BY F.Feedback_Date DESC")]);
    }
    public function store(Request $req){
        $req->validate(["Customer_ID"=>"required","Rating"=>"required|integer|min:1|max:5"]);
        $id=DB::table("FEEDBACK")->insertGetId(["Customer_ID"=>$req->Customer_ID,"Feedback_Date"=>$req->Feedback_Date??now()->toDateString(),"Rating"=>$req->Rating,"Category"=>$req->Category??"","Comments"=>$req->Comments??""]);
        return response()->json(["message"=>"Recorded","id"=>$id],201);
    }
}