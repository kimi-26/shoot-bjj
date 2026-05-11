// ============================================================
// 배움쪽지 사진 수신 → Google Drive 저장
//
// [배포 방법]
// 1. script.google.com → 새 프로젝트 → 이 코드 전체 붙여넣기
// 2. 오른쪽 위 [배포] → [새 배포]
// 3. 유형: 웹 앱
//    실행 계정: 나 (Me)
//    액세스 권한: 모든 사용자 (Anyone)
// 4. [배포] 클릭 → URL 복사 → 앱 설정에 붙여넣기
//
// [재배포 시]
// 코드 수정 후엔 [배포] → [배포 관리] → 연필 아이콘 → 버전: 새 버전 → 배포
// ============================================================

var ROOT_FOLDER_NAME = '배움쪽지';

function doPost(e) {
  try {
    var data;
    // form submit 방식 (hidden form POST)
    if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    }
    // fetch/XHR 방식 (fallback)
    else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    else {
      throw new Error('데이터 없음');
    }

    var base64Image = data.image;
    var filename    = data.filename;
    var dateStr     = data.date;

    var rootFolder = getOrCreateFolder(ROOT_FOLDER_NAME, DriveApp.getRootFolder());
    var dateFolder = getOrCreateFolder(dateStr, rootFolder);

    var decoded = Utilities.base64Decode(base64Image);
    var blob    = Utilities.newBlob(decoded, 'image/jpeg', filename);
    var file    = dateFolder.createFile(blob);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, fileId: file.getId(), name: filename }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(name, parent) {
  var iter = parent.getFoldersByName(name);
  return iter.hasNext() ? iter.next() : parent.createFolder(name);
}
