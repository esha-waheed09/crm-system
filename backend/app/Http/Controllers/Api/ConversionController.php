<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
class ConversionController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT CE.*,PL.Person_Name AS Lead_Name,PC.Person_Name AS Customer_Name,PR.Person_Name AS Rep_Name,CU.Total_Purchase_Value FROM CONVERSION_EVENT CE JOIN PERSON PL ON CE.Lead_ID=PL.Person_ID JOIN PERSON PC ON CE.Customer_ID=PC.Person_ID JOIN PERSON PR ON CE.Rep_ID=PR.Person_ID JOIN CUSTOMER CU ON CE.Customer_ID=CU.Person_ID ORDER BY CE.Conversion_Date DESC")]);
    }
}