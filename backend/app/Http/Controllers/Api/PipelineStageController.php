<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
class PipelineStageController extends Controller {
    public function index(){
        return response()->json(["data"=>DB::select("SELECT PS.*,COUNT(L.Person_ID) AS Lead_Count FROM PIPELINE_STAGE PS LEFT JOIN LEADS L ON L.Stage_ID=PS.Stage_ID GROUP BY PS.Stage_ID,PS.Stage_Name,PS.Stage_Order,PS.Description ORDER BY PS.Stage_Order")]);
    }
}