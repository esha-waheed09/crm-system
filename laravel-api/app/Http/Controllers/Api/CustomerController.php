<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class CustomerController extends Controller {
    public function index() {
        return response()->json(["data"=>DB::select("SELECT C.Person_ID,P.Person_Name,P.Email,P.Phone,P.Address,C.Conversion_Date,C.Total_Purchase_Value,ROUND(AVG(F.Rating),2) AS Avg_Rating,COUNT(F.Feedback_ID) AS Total_Feedback FROM CUSTOMER C JOIN PERSON P ON C.Person_ID=P.Person_ID LEFT JOIN FEEDBACK F ON F.Customer_ID=C.Person_ID GROUP BY C.Person_ID,P.Person_Name,P.Email,P.Phone,P.Address,C.Conversion_Date,C.Total_Purchase_Value ORDER BY C.Total_Purchase_Value DESC")]);
    }
    public function show($id) {
        $r=DB::select("SELECT C.*,P.Person_Name,P.Email FROM CUSTOMER C JOIN PERSON P ON C.Person_ID=P.Person_ID WHERE C.Person_ID=?",[$id]);
        return response()->json(["data"=>$r[0]??null]);
    }
    public function update(Request $req,$id) {
        DB::table("CUSTOMER")->where("Person_ID",$id)->update($req->only(["Total_Purchase_Value","Conversion_Date"]));
        return response()->json(["message"=>"Updated"]);
    }
}