<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
class SalesRepController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT SR.*,P.Person_Name,P.Email,COUNT(DISTINCT L.Person_ID) AS Leads_Assigned,COUNT(DISTINCT CE.Lead_ID) AS Conversions FROM SALES_REP SR JOIN PERSON P ON SR.Person_ID=P.Person_ID LEFT JOIN LEADS L ON L.Rep_ID=SR.Person_ID LEFT JOIN CONVERSION_EVENT CE ON CE.Rep_ID=SR.Person_ID GROUP BY SR.Person_ID,SR.Employee_ID,SR.Department,SR.Hire_Date,SR.Commission_Rate,P.Person_Name,P.Email")]);
    }
    public function show($id){$r=DB::select("SELECT SR.*,P.Person_Name FROM SALES_REP SR JOIN PERSON P ON SR.Person_ID=P.Person_ID WHERE SR.Person_ID=?",[$id]);return response()->json(["data"=>$r[0]??null]);}
    public function store(\Illuminate\Http\Request $r){return response()->json(["message"=>"Not implemented"],501);}
    public function update(\Illuminate\Http\Request $r,$id){return response()->json(["message"=>"Not implemented"],501);}
    public function destroy($id){return response()->json(["message"=>"Not implemented"],501);}
}