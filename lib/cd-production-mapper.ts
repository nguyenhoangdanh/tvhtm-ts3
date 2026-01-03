/**
 * CD Production Data Mapper
 * Maps backend CD response to frontend ProductionData format
 *
 * Backend structure: /api/display/tv?code=KVHB07CD26
 * Returns: { success, code, lineType: 'CD', factory, data: [4 lines], count: 4 }
 */

import { ProductionData } from "@/stores/productionStore";

/**
 * Map backend CD TV response to frontend ProductionData format
 * Backend returns 4 CD lines per factory
 */
export function mapCDTVResponse(backendResponse: any): ProductionData {
  if (!backendResponse.success || !backendResponse.data) {
    throw new Error("Invalid backend response structure");
  }

  const allLines = Array.isArray(backendResponse.data)
    ? backendResponse.data
    : [backendResponse.data];

  // ✅ CRITICAL VALIDATION: Verify factory consistency
  const factories = [...new Set(allLines.map((l: any) => l.nhaMay))];
  const expectedFactory = backendResponse.factory;

  // ✅ CRITICAL ERROR: Log factory validation
  if (factories.length > 1) {
    console.error(`❌ Mapper: MULTIPLE FACTORIES in response!`, {
      expected: expectedFactory,
      received: factories,
      lines: allLines.map((l: any) => ({
        code: l.maChuyenLine,
        factory: l.nhaMay,
      })),
    });
  } else if (expectedFactory && factories[0] !== expectedFactory) {
    console.error(`❌ Mapper: FACTORY MISMATCH!`, {
      expected: expectedFactory,
      received: factories[0],
    });
  }

  const requestedLine =
    allLines.find((line: any) => line.maChuyenLine === backendResponse.code) ||
    allLines[0];

  if (!requestedLine) {
    throw new Error(`No data found for ${backendResponse.code}`);
  }

  return {
    lineType: "CD",
    maChuyenLine: requestedLine.maChuyenLine || backendResponse.code,
    nhaMay: requestedLine.nhaMay || backendResponse.factory || "",
    line: requestedLine.line || "",
    to: requestedLine.to || "",
    maHang: requestedLine.maHang || "",
    canBoQuanLy: requestedLine.canBoQuanLy || "",
    slth: requestedLine.slth || 0,
    congKh: requestedLine.congKh || 0,
    congTh: requestedLine.congTh || 0,
    pphKh: requestedLine.pphKh || 0,
    pphTh: requestedLine.pphTh || 0,
    phanTramHtPph: requestedLine.phanTramHtPph || 0,
    gioSx: requestedLine.gioSx || 0,
    ldCoMat: requestedLine.ldCoMat || 0,
    ldLayout: requestedLine.ldLayout || 0,
    ldHienCo: requestedLine.ldHienCo || 0,
    nangSuat: requestedLine.nangSuat || 0,
    pphTarget: requestedLine.pphTarget || 0,
    pphGiao: requestedLine.pphGiao || 0,
    phanTramGiao: requestedLine.phanTramGiao || 0,
    targetNgay: requestedLine.targetNgay || 0,
    targetGio: requestedLine.targetGio || 0,
    lkth: requestedLine.lkth || 0,
    phanTramHt: requestedLine.phanTramHt || 0,
    hourlyData: requestedLine.hourlyData || {},
    lean: requestedLine.lean || "",
    phanTram100: requestedLine.phanTram100 || 0,
    t: requestedLine.t || 0,
    l: requestedLine.l || 0,
    image: requestedLine.image || "",
    lkkh: requestedLine.lkkh || 0,
    bqTargetGio: requestedLine.bqTargetGio || 0,
    slcl: requestedLine.slcl || 0,
    rft: requestedLine.rft || 0,
    tongKiem: requestedLine.tongKiem || 0,
    mucTieuRft: requestedLine.mucTieuRft || 0,
    lktuiloi: requestedLine.lktuiloi || 0,
    nhipsx: requestedLine.nhipsx || 0,
    tansuat: requestedLine.tansuat || 0,
    tyleloi: requestedLine.tyleloi || 0,
    loikeo: requestedLine.loikeo || 0,
    loison: requestedLine.loison || 0,
    loichi: requestedLine.loichi || 0,
    phanTramLoiKeo: requestedLine.phanTramLoiKeo || 0,
    phanTramLoiSon: requestedLine.phanTramLoiSon || 0,
    phanTramLoiChi: requestedLine.phanTramLoiChi || 0,
    QCTarget: requestedLine.QCTarget || 0,
    tongDat: requestedLine.tongDat || 0,
    tuiChuaTaiChe: requestedLine.tuiChuaTaiChe || 0,
    tuiChuaTaiCheNew: requestedLine.tuiChuaTaiCheNew || 0,
    thoigianlamviec: requestedLine.thoigianlamviec || 0,
    tongKiemNew: requestedLine.tongKiemNew || 0,
    tongDatNew: requestedLine.tongDatNew || 0,
    tongLoiNew: requestedLine.tongLoiNew || 0,
    lktuiloiNew: requestedLine.lktuiloiNew || 0,
    percentagePPHNew: requestedLine.percentagePPHNew || 0,
    percentageSLTHNew: requestedLine.percentageSLTHNew || 0,
    diffPercentagePPHNew: requestedLine.diffPercentagePPHNew || 0,
    diffPercentageSLTHNew: requestedLine.diffPercentageSLTHNew || 0,
    khGiaoThang:
      requestedLine.monthlyPlanData?.khGiaoThang ||
      requestedLine.khGiaoThang ||
      0,
    khbqGQ: requestedLine.khbqGQ || 0,
    slkh_bqlk:
      requestedLine.monthlyPlanData?.slkhBq || requestedLine.slkh_bqlk || 0,
    slthThang:
      requestedLine.monthlyPlanData?.slthThang || requestedLine.slthThang || 0,
    phanTramThang:
      requestedLine.monthlyPlanData?.phanTramThang ||
      requestedLine.phanTramThang ||
      0,
    conlai: requestedLine.monthlyPlanData?.clThang || requestedLine.conlai || 0,
    bqCansxNgay:
      requestedLine.monthlyPlanData?.bqCanSxNgay ||
      requestedLine.bqCansxNgay ||
      0,
    tglv: requestedLine.tglv || 0,
    ncdv: requestedLine.ncdv || 0,
    dbcu: requestedLine.dbcu || 0,
    subRows: requestedLine.subRows || [],
    ncdvTotal: requestedLine.ncdvTotal || requestedLine.ncdv || 0,
    dbcuTotal: requestedLine.dbcuTotal || requestedLine.dbcu || 0,
    tonMayTotal: requestedLine.tonMayTotal || 0,
    nc1nttTotal: requestedLine.nc1nttTotal || 0,
    nc2nttTotal: requestedLine.nc2nttTotal || 0,
    nc3nttTotal: requestedLine.nc3nttTotal || 0,
    db1nttTotal: requestedLine.db1nttTotal || 0,
    db2nttTotal: requestedLine.db2nttTotal || 0,
    db3nttTotal: requestedLine.db3nttTotal || 0,
    dbNgayTotal: requestedLine.dbNgayTotal || 0,
    groupingRule: requestedLine.groupingRule || null,
    diffLdCoMatLayout: requestedLine.diffLdCoMatLayout || 0,
    actual_quantity: requestedLine.slth || 0,
    targetDay: requestedLine.targetNgay || 0,
    _lastUpdate: Date.now(),
    _renderKey: Date.now(),
  };
}

/**
 * Map CD WebSocket update to ProductionData format
 */
export function mapCDWebSocketUpdate(
  wsUpdate: any,
  currentData: ProductionData
): ProductionData {
  if (!wsUpdate || !wsUpdate.data) {
    return currentData;
  }

  const updateData =
    wsUpdate.data.data || wsUpdate.data.summary || wsUpdate.data;

  if (updateData.lineType && updateData.lineType !== "CD") {
    return currentData;
  }

  return {
    ...currentData,
    ...(updateData.slth !== undefined && { slth: updateData.slth }),
    ...(updateData.lkth !== undefined && { lkth: updateData.lkth }),
    ...(updateData.phanTramHt !== undefined && {
      phanTramHt: updateData.phanTramHt,
    }),
    ...(updateData.hourlyData && { hourlyData: updateData.hourlyData }),
    ...(updateData.subRows && { subRows: updateData.subRows }),
    ...(updateData.ncdvTotal !== undefined && {
      ncdvTotal: updateData.ncdvTotal,
    }),
    ...(updateData.dbcuTotal !== undefined && {
      dbcuTotal: updateData.dbcuTotal,
    }),
    ...(updateData.tonMayTotal !== undefined && {
      tonMayTotal: updateData.tonMayTotal,
    }),
    _lastUpdate: Date.now(),
    _lastSocketUpdate: Date.now(),
    _renderKey: Date.now(),
  };
}

/**
 * Format all 4 CD lines for TV display
 * Returns array of all 4 CD lines for the factory
 */
export function formatAllCDLines(backendResponse: any): Array<ProductionData> {
  if (!backendResponse.success || !backendResponse.data) {
    return [];
  }

  const allLines = Array.isArray(backendResponse.data)
    ? backendResponse.data
    : [backendResponse.data];

  return allLines.map((line: any) =>
    mapCDTVResponse({ ...backendResponse, data: line })
  );
}

/**
 * Extract factory from CD code
 * KVHB07CD16-19 = TS1
 * KVHB07CD20-23 = TS2
 * KVHB07CD24-27 = TS3
 */
export function extractFactoryFromCDCode(code: string): string {
  if (!code || !code.includes("CD")) return "TS1";

  // Extract number from code (e.g., KVHB07CD26 -> 26)
  const match = code.match(/CD(\d+)/);
  if (!match) return "TS1";

  const lineNumber = parseInt(match[1]);

  // Factory mapping
  if (lineNumber >= 16 && lineNumber <= 19) return "TS1";
  if (lineNumber >= 20 && lineNumber <= 23) return "TS2";
  if (lineNumber >= 24 && lineNumber <= 27) return "TS3";

  return "TS1"; // Default
}
