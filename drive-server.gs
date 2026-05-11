// ============================================================
// 배움쪽지 사진 수신 → Google Drive 저장
// 사용법:
//   1. script.google.com → 새 프로젝트
//   2. 이 코드 전체 붙여넣기
//   3. 배포 → 새 배포 → 웹 앱
//      실행 계정: 나(Me)
//      액세스 권한: 모든 사용자(Anyone)
//   4. 배포 → URL 복사 → 카메라 앱 설정에 붙여넣기
// ============================================================

var FOLDER_NAME = '배움쪽지';  // Drive에 생성될 최상위 폴더 이름

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var base64Image = data.image;        // base64 문자열 (data:image/jpeg;base64, 제거된 것)
    var filename    = data.filename;     // 예: 2026-05-11_20b_p1.jpg
    var dateStr     = data.date;         // 예: 2026-05-11

    // 최상위 폴더 찾거나 생성
    var rootFolder = getOrCreateFolder(FOLDER_NAME, DriveApp.getRootFolder());
    // 날짜 하위 폴더
    var dateFolder = getOrCreateFolder(dateStr, rootFolder);

    // base64 → 파일 저장
    var decoded = Utilities.base64Decode(base64Image);
    var blob    = Utilities.newBlob(decoded, 'image/jpeg', filename);
    var file    = dateFolder.createFile(blob);

    return jsonResponse({ success: true, fileId: file.getId(), name: filename });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// CORS preflight 대응
function doGet(e) {
  return jsonResponse({ status: 'ok', message: '배움쪽지 Drive 수신 서버' });
}

function getOrCreateFolder(name, parent) {
  var folders = parent.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(name);
}

function jsonResponse(obj) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
