// Production Data Mapper - chính xác theo backend GoogleSheetsProductionDto
import { ProductionData } from '../stores/productionStore';

/**
 * Detect line type from code
 */
export function detectLineType(code: string): 'HTM' | 'CD' {
  if (!code) return 'HTM';
  
  // CD lines have CD in the code (e.g., KVHB07CD27)
  if (code.includes('CD')) {
    return 'CD';
  }
  
  // Default to HTM
  return 'HTM';
}

/**
 * Map TV Display response to ProductionData structure
 */
export function mapTVDisplayResponse(tvResponse: any): ProductionData {
  const data = tvResponse.data || tvResponse;
  const lineType = tvResponse.lineType || detectLineType(data.maChuyenLine || data.maChuyen);

  return {
    // Line type identifier
    lineType,
    
    // Thông tin cơ bản (A-E) - match với backend
    maChuyenLine: data.maChuyen || data.maChuyenLine || '',
    nhaMay: data.nhaMay || tvResponse.factory || '',
    line: data.line || '',
    to: data.to || tvResponse.team || '',
    maHang: data.maHang || '',

    // Sản lượng và công việc (F-L) - match với backend structure
    slth: data.metrics?.slth || 0,
    congKh: data.metrics?.congKh || 0,
    congTh: data.metrics?.congTh || 0,
    pphKh: data.metrics?.pphKh || 0,
    pphTh: data.metrics?.pphTh || 0,
    phanTramHtPph: data.metrics?.phanTramHtPph || 0, // K: %HT PPH (chuẩn hóa)
    gioSx: data.metrics?.gioSx || 0,
    pphThNew: data.metrics?.pphThNew || 0, // TEST field

    // Nhân lực (M-P)
    ldCoMat: data.metrics?.ldCoMat || 0,
    ldLayout: data.metrics?.ldLayout || 0,
    ldHienCo: data.metrics?.ldHienCo || 0,
    nangSuat: data.metrics?.nangSuat || 0,

    // PPH và Target (Q-W)
    pphTarget: data.metrics?.pphTarget || 0,
    pphGiao: data.metrics?.pphGiao || 0,
    phanTramGiao: data.metrics?.phanTramGiao || 0,
    targetNgay: data.metrics?.targetNgay || 0,
    targetGio: data.metrics?.targetGio || 0,
    lkth: data.metrics?.lkth || 0,
    phanTramHt: data.metrics?.phanTramHt || 0, // W: %HT (chuẩn hóa)

    // Dữ liệu theo giờ (X-AH) - chuẩn hóa key names
    // h830: data.metrics?.h830 || 0,   // X: 8H30
    // h930: data.metrics?.h930 || 0,   // Y: 9H30
    // h1030: data.metrics?.h1030 || 0, // Z: 10H30
    // h1130: data.metrics?.h1130 || 0, // AA: 11H30
    // h1330: data.metrics?.h1330 || 0, // AB: 13H30
    // h1430: data.metrics?.h1430 || 0, // AC: 14H30
    // h1530: data.metrics?.h1530 || 0, // AD: 15H30
    // h1630: data.metrics?.h1630 || 0, // AE: 16H30
    // h1800: data.metrics?.h1800 || 0, // AF: 18H00
    // h1900: data.metrics?.h1900 || 0, // AG: 19H00
    // h2000: data.metrics?.h2000 || 0, // AH: 20H00
    // percentageh830: data.metrics?.percentageh830 || 0,
    // percentageh930: data.metrics?.percentageh930 || 0,
    // percentageh1030: data.metrics?.percentageh1030 || 0,
    // percentageh1130: data.metrics?.percentageh1130 || 0,
    // percentageh1330: data.metrics?.percentageh1330 || 0,
    // percentageh1430: data.metrics?.percentageh1430 || 0,
    // percentageh1530: data.metrics?.percentageh1530 || 0,
    // percentageh1630: data.metrics?.percentageh1630 || 0,
    // percentageh1800: data.metrics?.percentageh1800 || 0,
    // percentageh1900: data.metrics?.percentageh1900 || 0,
    // percentageh2000: data.metrics?.percentageh2000 || 0,

    tongDat: data.metrics?.tongDat || 0,
    tuiChuaTaiChe: data.metrics?.tuiChuaTaiChe || 0,
    tuiChuaTaiCheNew: data.metrics?.tuiChuaTaiCheNew || 0,

    thoigianlamviec: data.metrics?.thoigianlamviec || 0,
    tongKiemNew: data.metrics?.tongKiemNew || 0,
    tongDatNew: data.metrics?.tongDatNew || 0,
    tongLoiNew: data.metrics?.tongLoiNew || 0,


    lktuiloiNew: data.metrics?.lktuiloiNew || 0,
    percentagePPHNew: data.metrics?.percentagePPHNew || 0,
    percentageSLTHNew: data.metrics?.percentageSLTHNew || 0,
    diffPercentagePPHNew: data.metrics?.diffPercentagePPHNew || 0,
    diffPercentageSLTHNew: data.metrics?.diffPercentageSLTHNew || 0,

    // Hourly data object - PRESERVE backend nested structure EXACTLY
    // Backend returns: { hourly: {...}, cumulative: {...}, total: 0, latest: {...} }
    hourlyData: data.hourlyData || {},

    // Thông tin bổ sung (AI-AM)
    lean: data.metrics?.lean || '',
    phanTram100: data.metrics?.phanTram100 || 0, // AJ: 100%
    t: data.metrics?.t || 0,                     // AK: T
    l: data.metrics?.l || 0,                     // AL: L
    image: data.metrics?.image || '',            // AM: IMAGE

    // Chỉ số chất lượng (AN-AS)
    lkkh: data.metrics?.lkkh || 0,
    bqTargetGio: data.metrics?.bqTargetGio || 0, // AO: BQ TARGET GIỜ
    slcl: data.metrics?.slcl || 0,
    rft: data.metrics?.rft || 0,
    tongKiem: data.metrics?.tongKiem || 0,
    mucTieuRft: data.metrics?.mucTieuRft || 95,

    lktuiloi: data.metrics?.lktuiloi || 0,
    nhipsx: data.metrics?.nhipsx || 0,
    tansuat: data.metrics?.tansuat || 0,
    tyleloi: data.metrics?.tyleloi || 0,
    loikeo: data.metrics?.loikeo || 0,
    loison: data.metrics?.loison || 0,
    loichi: data.metrics?.loichi || 0,
    phanTramLoiKeo: data.metrics?.phanTramLoiKeo || 0,
    phanTramLoiSon: data.metrics?.phanTramLoiSon || 0,
    phanTramLoiChi: data.metrics?.phanTramLoiChi || 0,
    QCTarget: data.metrics?.QCTarget || 0,

    // CD-specific fields (always include, backend will return 0 for HTM lines)
    loiDinhKeo: data.metrics?.loiDinhKeo || 0,
    loiBungKeo: data.metrics?.loiBungKeo || 0,
    loiLang: data.metrics?.loiLang || 0,
    loiDuongMay: data.metrics?.loiDuongMay || 0,
    loiVatTu: data.metrics?.loiVatTu || 0,
    loiMauKDB: data.metrics?.loiMauKDB || 0,
    loiNhan: data.metrics?.loiNhan || 0,
    loiEpNhiet: data.metrics?.loiEpNhiet || 0,
    loiFoil: data.metrics?.loiFoil || 0,
    loiKhac: data.metrics?.loiKhac || 0,
    
    khCd: data.metrics?.khCd || 0,
    slthCd: data.metrics?.slthCd || 0,
    slclCd: data.metrics?.slclCd || 0,
    phanTramTienDo: data.metrics?.phanTramTienDo || 0,
    
    phanTramLoiDinhKeo: data.metrics?.phanTramLoiDinhKeo || 0,
    phanTramLoiBungKeo: data.metrics?.phanTramLoiBungKeo || 0,
    phanTramLoiLang: data.metrics?.phanTramLoiLang || 0,
    phanTramLoiDuongMay: data.metrics?.phanTramLoiDuongMay || 0,
    phanTramLoiVatTu: data.metrics?.phanTramLoiVatTu || 0,
    phanTramLoiMauKDB: data.metrics?.phanTramLoiMauKDB || 0,
    phanTramLoiNhan: data.metrics?.phanTramLoiNhan || 0,
    phanTramLoiEpNhiet: data.metrics?.phanTramLoiEpNhiet || 0,
    phanTramLoiFoil: data.metrics?.phanTramLoiFoil || 0,
    phanTramLoiKhac: data.metrics?.phanTramLoiKhac || 0,
    
    tonBqNgay: data.metrics?.tonBqNgay || 0,
    ngayTon: data.metrics?.ngayTon || 0,
    tonMay: data.metrics?.tonMay || 0,
    ngayTonMay: data.metrics?.ngayTonMay || 0,
    
    tglv: data.metrics?.thoigianlamviec || 0,
    kiemNew: data.metrics?.tongKiemNew || 0,
    datNew: data.metrics?.tongDatNew || 0,
    
    rftDetail: data.rftDetail || undefined,
    
    // Diff fields from backend
    diffLdCoMatLayout: data.metrics?.diffLdCoMatLayout || 0,
    diffLkthTarget: data.metrics?.diffLkthTarget || 0,
    diffRftTarget: data.metrics?.diffRftTarget || 0,
    diffBqTargetSlcl: data.metrics?.diffBqTargetSlcl || 0,
    ratioPphThKh: data.metrics?.ratioPphThKh || 0,
    diffPhanTramHt100: data.metrics?.diffPhanTramHt100 || 0,
    diffPhanTramHtPph100: data.metrics?.diffPhanTramHtPph100 || 0,

    // Compatibility fields
    actual_quantity: data.metrics?.slth || 0,
    targetDay: data.metrics?.targetNgay || 0,

    // Metadata
    _lastUpdate: Date.now(),
    _renderKey: Date.now()
  };
}

/**
 * Map Production API response to ProductionData structure
 */
export function mapProductionResponse(apiResponse: any): ProductionData {
  const record = apiResponse.data || apiResponse.summary || apiResponse;
  const lineType = detectLineType(record.maChuyenLine || record.maChuyen || '');
  
  return {
    // Line type identifier
    lineType,
    
    // Thông tin cơ bản (A-E)
    maChuyenLine: record.maChuyenLine || record.maChuyen || '',
    nhaMay: record.nhaMay || record.factory || '',
    line: record.line || '',
    to: record.to || record.team || '',
    maHang: record.maHang || '',

    // Sản lượng và công việc (F-L)
    slth: record.slth || 0,
    congKh: record.congKh || 0,
    congTh: record.congTh || 0,
    pphKh: record.pphKh || 0,
    pphTh: record.pphTh || 0,
    phanTramHtPph: record.phanTramHtPph || record.hitPPH || 0, // K: %HT PPH (chuẩn hóa)
    gioSx: record.gioSx || 0,
    pphThNew: record.pphThNew || 0, // TEST field

    // Nhân lực (M-P)
    ldCoMat: record.ldCoMat || 0,
    ldLayout: record.ldLayout || 0,
    ldHienCo: record.ldHienCo || 0,
    nangSuat: record.nangSuat || 0,

    // PPH và Target (Q-W)
    pphTarget: record.pphTarget || 0,
    pphGiao: record.pphGiao || 0,
    phanTramGiao: record.phanTramGiao || 0,
    targetNgay: record.targetNgay || record.targetDay || 0,
    targetGio: record.targetGio || 0,
    lkth: record.lkth || 0,
    phanTramHt: record.phanTramHt || record.hitSLTH || 0, // W: %HT (chuẩn hóa)

    // Dữ liệu theo giờ (X-AH) - chuẩn hóa key names
    // h830: record.h830 || 0,   // X: 8H30
    // h930: record.h930 || 0,   // Y: 9H30
    // h1030: record.h1030 || 0, // Z: 10H30
    // h1130: record.h1130 || 0, // AA: 11H30
    // h1330: record.h1330 || 0, // AB: 13H30
    // h1430: record.h1430 || 0, // AC: 14H30
    // h1530: record.h1530 || 0, // AD: 15H30
    // h1630: record.h1630 || 0, // AE: 16H30
    // h1800: record.h1800 || 0, // AF: 18H00
    // h1900: record.h1900 || 0, // AG: 19H00
    // h2000: record.h2000 || 0, // AH: 20H00,
    // percentageh830: record.percentageh830 || 0,
    // percentageh930: record.percentageh930 || 0,
    // percentageh1030: record.percentageh1030 || 0,
    // percentageh1130: record.percentageh1130 || 0,
    // percentageh1330: record.percentageh1330 || 0,
    // percentageh1430: record.percentageh1430 || 0,
    // percentageh1530: record.percentageh1530 || 0,
    // percentageh1630: record.percentageh1630 || 0,
    // percentageh1800: record.percentageh1800 || 0,
    // percentageh1900: record.percentageh1900 || 0,
    // percentageh2000: record.percentageh2000 || 0,

    tongDat: record.tongDat || 0,
    tuiChuaTaiChe: record.tuiChuaTaiChe || 0,
    tuiChuaTaiCheNew: record.tuiChuaTaiCheNew || 0,


    thoigianlamviec: record.thoigianlamviec || 0,
    tongKiemNew: record.tongKiemNew || 0,
    tongDatNew: record.tongDatNew || 0,
    tongLoiNew: record.tongLoiNew || 0,

    lktuiloiNew: record.lktuiloiNew || 0,
    percentagePPHNew: record.percentagePPHNew || 0,
    percentageSLTHNew: record.percentageSLTHNew || 0,
    diffPercentagePPHNew: record.diffPercentagePPHNew || 0,
    diffPercentageSLTHNew: record.diffPercentageSLTHNew || 0,

    // Hourly data object cho compatibility và chart
    hourlyData: record.hourlyData || {
      h830: record.h830 || 0,
      h930: record.h930 || 0,
      h1030: record.h1030 || 0,
      h1130: record.h1130 || 0,
      h1330: record.h1330 || 0,
      h1430: record.h1430 || 0,
      h1530: record.h1530 || 0,
      h1630: record.h1630 || 0,
      h1800: record.h1800 || 0,
      h1900: record.h1900 || 0,
      h2000: record.h2000 || 0,
      percentageh830: record.percentageh830 || 0,
      percentageh930: record.percentageh930 || 0,
      percentageh1030: record.percentageh1030 || 0,
      percentageh1130: record.percentageh1130 || 0,
      percentageh1330: record.percentageh1330 || 0,
      percentageh1430: record.percentageh1430 || 0,
      percentageh1530: record.percentageh1530 || 0,
      percentageh1630: record.percentageh1630 || 0,
      percentageh1800: record.percentageh1800 || 0,
      percentageh1900: record.percentageh1900 || 0,
      percentageh2000: record.percentageh2000 || 0,
    },

    // Thông tin bổ sung (AI-AM)
    lean: record.lean || '',
    phanTram100: record.phanTram100 || 0, // AJ: 100%
    t: record.t || 0,                     // AK: T
    l: record.l || 0,                     // AL: L
    image: record.image || '',            // AM: IMAGE

    // Chỉ số chất lượng (AN-AS)
    lkkh: record.lkkh || 0,
    bqTargetGio: record.bqTargetGio || record.boTargetGio || 0, // AO: BQ TARGET GIỜ
    slcl: record.slcl || 0,
    rft: record.rft || 0,
    tongKiem: record.tongKiem || 0,
    mucTieuRft: record.mucTieuRft || 95,

    // Additional fields (AT-AX)
    lktuiloi: record.lktuiloi || 0,
    nhipsx: record.nhipsx || 0,
    tansuat: record.tansuat || 0,
    tyleloi: record.tyleloi || 0,
    loikeo: record.loikeo || 0,
    loison: record.loison || 0,
    loichi: record.loichi || 0,

    phanTramLoiKeo: record.phanTramLoiKeo || 0,
    phanTramLoiSon: record.phanTramLoiSon || 0,
    phanTramLoiChi: record.phanTramLoiChi || 0,
    QCTarget: record.QCTarget || 0,

    // CD-specific fields (always map from record)
    loiDinhKeo: record.loiDinhKeo || 0,
    loiBungKeo: record.loiBungKeo || 0,
    loiLang: record.loiLang || 0,
    loiDuongMay: record.loiDuongMay || 0,
    loiVatTu: record.loiVatTu || 0,
    loiMauKDB: record.loiMauKDB || 0,
    loiNhan: record.loiNhan || 0,
    loiEpNhiet: record.loiEpNhiet || 0,
    loiFoil: record.loiFoil || 0,
    loiKhac: record.loiKhac || 0,
    
    khCd: record.khCd || 0,
    slthCd: record.slthCd || 0,
    slclCd: record.slclCd || 0,
    phanTramTienDo: record.phanTramTienDo || 0,
    
    phanTramLoiDinhKeo: record.phanTramLoiDinhKeo || 0,
    phanTramLoiBungKeo: record.phanTramLoiBungKeo || 0,
    phanTramLoiLang: record.phanTramLoiLang || 0,
    phanTramLoiDuongMay: record.phanTramLoiDuongMay || 0,
    phanTramLoiVatTu: record.phanTramLoiVatTu || 0,
    phanTramLoiMauKDB: record.phanTramLoiMauKDB || 0,
    phanTramLoiNhan: record.phanTramLoiNhan || 0,
    phanTramLoiEpNhiet: record.phanTramLoiEpNhiet || 0,
    phanTramLoiFoil: record.phanTramLoiFoil || 0,
    phanTramLoiKhac: record.phanTramLoiKhac || 0,
    
    tonBqNgay: record.tonBqNgay || 0,
    ngayTon: record.ngayTon || 0,
    tonMay: record.tonMay || 0,
    ngayTonMay: record.ngayTonMay || 0,
    
    tglv: record.thoigianlamviec || record.tglv || 0,
    kiemNew: record.tongKiemNew || record.kiemNew || 0,
    datNew: record.tongDatNew || record.datNew || 0,
    
    rftDetail: record.rftDetail || undefined,

    // CD Sub-rows data (NEW) - Full structure with all fields
    subRows: record.subRows || [],
    ncdvTotal: record.ncdvTotal || record.ncdv || 0,
    dbcuTotal: record.dbcuTotal || record.dbcu || 0,
    tonMayTotal: record.tonMayTotal || 0,
    nc1nttTotal: record.nc1nttTotal || 0,
    nc2nttTotal: record.nc2nttTotal || 0,
    nc3nttTotal: record.nc3nttTotal || 0,
    db1nttTotal: record.db1nttTotal || 0,
    db2nttTotal: record.db2nttTotal || 0,
    db3nttTotal: record.db3nttTotal || 0,
    dbNgayTotal: record.dbNgayTotal || record.dbNgay || 0,

    // Grouping metadata
    groupingRule: record.groupingRule || null,

    // Compatibility fields
    actual_quantity: record.actual_quantity || record.slth || 0,
    targetDay: record.targetDay || record.targetNgay || 0,

    // Metadata
    _lastUpdate: Date.now(),
    _renderKey: Date.now()
  };
}

/**
 * Map WebSocket real-time update to ProductionData structure
 */
export function mapWebSocketUpdate(updateData: any, prevData: ProductionData): ProductionData {
  // Extract record from different possible structures
  let newRecord = null;
  
  if (updateData.data?.data) {
    newRecord = updateData.data.data;
  } else if (updateData.data && updateData.data.maChuyenLine) {
    newRecord = updateData.data;
  } else if (updateData.maChuyenLine) {
    newRecord = updateData;
  }
  
  if (!newRecord) {
    return prevData;
  }
  
  return {
    ...prevData,
    // Update chỉ các fields có trong real-time update
    maChuyenLine: newRecord.maChuyenLine || newRecord.maChuyen || prevData.maChuyenLine,
    nhaMay: newRecord.nhaMay || prevData.nhaMay,
    line: newRecord.line || prevData.line,
    to: newRecord.to || prevData.to,
    maHang: newRecord.maHang || prevData.maHang,
    
    // Sản lượng fields thường được update real-time
    slth: newRecord.slth ?? prevData.slth,
    lkth: newRecord.lkth ?? prevData.lkth,
    phanTramHt: newRecord.phanTramHt ?? newRecord.hitSLTH ?? prevData.phanTramHt, // W: %HT (chuẩn hóa)
    
    // PPH fields
    pphTh: newRecord.pphTh ?? prevData.pphTh,
    phanTramHtPph: newRecord.phanTramHtPph ?? newRecord.hitPPH ?? prevData.phanTramHtPph, // K: %HT PPH (chuẩn hóa)
    
    // Hourly data
    hourlyData: newRecord.hourlyData || prevData.hourlyData,

    // Update new fields if available
    tongDat: newRecord.tongDat ?? prevData.tongDat,
    tuiChuaTaiChe: newRecord.tuiChuaTaiChe ?? prevData.tuiChuaTaiChe,
    tuiChuaTaiCheNew: newRecord.tuiChuaTaiCheNew ?? prevData.tuiChuaTaiCheNew,

    thoigianlamviec: newRecord.thoigianlamviec ?? prevData.thoigianlamviec,
    tongKiemNew: newRecord.tongKiemNew ?? prevData.tongKiemNew,
    tongDatNew: newRecord.tongDatNew ?? prevData.tongDatNew,
    tongLoiNew: newRecord.tongLoiNew ?? prevData.tongLoiNew,


    lktuiloiNew: newRecord.lktuiloiNew ?? prevData.lktuiloiNew,
    percentagePPHNew: newRecord.percentagePPHNew ?? prevData.percentagePPHNew,
    percentageSLTHNew: newRecord.percentageSLTHNew ?? prevData.percentageSLTHNew,
    diffPercentagePPHNew: newRecord.diffPercentagePPHNew ?? prevData.diffPercentagePPHNew,
    diffPercentageSLTHNew: newRecord.diffPercentageSLTHNew ?? prevData.diffPercentageSLTHNew,

    // Update hourly fields if available
    // h830: newRecord.h830 ?? prevData.h830,
    // h930: newRecord.h930 ?? prevData.h930,
    // h1030: newRecord.h1030 ?? prevData.h1030,
    // h1130: newRecord.h1130 ?? prevData.h1130,
    // h1330: newRecord.h1330 ?? prevData.h1330,
    // h1430: newRecord.h1430 ?? prevData.h1430,
    // h1530: newRecord.h1530 ?? prevData.h1530,
    // h1630: newRecord.h1630 ?? prevData.h1630,
    // h1800: newRecord.h1800 ?? prevData.h1800,
    // h1900: newRecord.h1900 ?? prevData.h1900,
    // h2000: newRecord.h2000 ?? prevData.h2000,
    // percentageh830: newRecord.percentageh830 ?? prevData.percentageh830,
    // percentageh930: newRecord.percentageh930 ?? prevData.percentageh930,
    // percentageh1030: newRecord.percentageh1030 ?? prevData.percentageh1030,
    // percentageh1130: newRecord.percentageh1130 ?? prevData.percentageh1130,
    // percentageh1330: newRecord.percentageh1330 ?? prevData.percentageh1330,
    // percentageh1430: newRecord.percentageh1430 ?? prevData.percentageh1430,
    // percentageh1530: newRecord.percentageh1530 ?? prevData.percentageh1530,
    // percentageh1630: newRecord.percentageh1630 ?? prevData.percentageh1630,
    // percentageh1800: newRecord.percentageh1800 ?? prevData.percentageh1800,
    // percentageh1900: newRecord.percentageh1900 ?? prevData.percentageh1900,
    // percentageh2000: newRecord.percentageh2000 ?? prevData.percentageh2000,

    // Quality fields
    slcl: newRecord.slcl ?? prevData.slcl,
    rft: newRecord.rft ?? prevData.rft,
    tongKiem: newRecord.tongKiem ?? prevData.tongKiem,
    mucTieuRft: newRecord.mucTieuRft ?? prevData.mucTieuRft,

    lktuiloi: newRecord.lktuiloi ?? prevData.lktuiloi,
    nhipsx: newRecord.nhipsx ?? prevData.nhipsx,
    tansuat: newRecord.tansuat ?? prevData.tansuat,
    tyleloi: newRecord.tyleloi ?? prevData.tyleloi,
    loikeo: newRecord.loikeo ?? prevData.loikeo,
    loison: newRecord.loison ?? prevData.loison,
    loichi: newRecord.loichi ?? prevData.loichi,

    // Update compatibility fields
    actual_quantity: newRecord.actual_quantity || newRecord.slth || prevData.actual_quantity,
    
    // Update metadata
    _lastUpdate: Date.now(),
    _renderKey: Date.now(),
  };
}

/**
 * Validate that data structure matches backend GoogleSheetsProductionDto
 */
export function validateProductionData(data: any): data is ProductionData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.maChuyenLine === 'string' &&
    typeof data.slth === 'number' &&
    typeof data.hourlyData === 'object'
  );
}

/**
 * Get field mapping for backward compatibility
 */
export function getFieldMapping() {
  return {
    // Legacy -> New field mapping
    actual_quantity: 'slth',
    targetDay: 'targetNgay',
    factory: 'nhaMay',
    team: 'to',
    // Thêm mappings khác nếu cần
  };
}