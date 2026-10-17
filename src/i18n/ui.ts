import type { Lang } from './langContext';
import { ui1 } from './strings/ui1';
import { ui2 } from './strings/ui2';
import { aiStrings } from './strings/ai';
import { d4 } from './strings/d4';
import { d5 } from './strings/d5';
import { d6 } from './strings/d6';

// en is the source of truth: vi must have exactly the same keys (checked by tsc)
const baseEn = {
  'app.loadingBook': 'Loading book...',
  'settings.title': 'Settings',
  'settings.profile': 'Baby Profile',
  'settings.profileHint': 'Used to personalize guidance in Ask AI.',
  'settings.editProfile': 'Edit baby profile',
  'settings.language': 'Language',
  'settings.languageHint': 'Choose the app language.',
  'settings.cloud': 'Cloud sync',
  'settings.signedInAs': 'Signed in as',
  'settings.lastSynced': 'Last synced',
  'settings.autoSync': 'Auto sync to cloud',
  'settings.autoSyncHint': 'Every 5 minutes while the app is open',
  'settings.syncToCloud': 'Sync to cloud',
  'settings.syncFromCloud': 'Sync from cloud',
  'settings.logout': 'Log out',
  'settings.backupHint': 'Back up your data and restore it on any device.',
  'settings.usernamePh': 'Username (a-z, 0-9, _ -)',
  'settings.codePh': '6-digit code',
  'settings.createAccount': 'Create account',
  'settings.login': 'Log in',
  'settings.app': 'App',
  'settings.newUpdate': 'New update',
  'settings.lastUpdated': 'Last updated',
  'settings.newVersion': 'A newer version of the app is ready.',
  'settings.newVersionHint': 'Tap below to refresh and get it.',
  'settings.checking': 'Checking…',
  'settings.updated': 'Updated! Reloading…',
  'settings.updateFailed': 'Update failed, try again',
  'settings.updateApp': 'Update app',
  'settings.danger': 'Danger zone',
  'settings.dangerHint': 'This will erase all data including milestones',
  'settings.reset': 'Reset app data',
  'settings.resetConfirm': 'Reset all app data? This cannot be undone.',
  'settings.somethingWrong': 'Something went wrong',
  'settings.accountCreated': 'Account created',
  'settings.signedIn': 'Signed in',
  'settings.synced': 'Synced to cloud',
  'settings.saveQ': 'Save to cloud?',
  'settings.loadQ': 'Load cloud data?',
  'settings.saveHint': 'The data saved in the cloud will be replaced with the data on this device.',
  'settings.loadHint': 'Your data on this device will be replaced with the data saved in the cloud.',
  'settings.cancel': 'Cancel',
  'settings.save': 'Save',
  'settings.load': 'Load',
  'settings.syncData': 'Sync your data',
  'settings.syncDataHint': "Your cloud data and this device's data are different. Choose which one to keep; the other side will be replaced.",
  'settings.notNow': 'Not now',
};

const baseVi: Record<keyof typeof baseEn, string> = {
  'app.loadingBook': 'Đang mở sách cho mẹ...',
  'settings.title': 'Cài đặt',
  'settings.profile': 'Hồ sơ của bé',
  'settings.profileHint': 'Giúp Hỏi AI gợi ý đúng với bé nhà mình hơn nhé.',
  'settings.editProfile': 'Cập nhật hồ sơ của bé',
  'settings.language': 'Ngôn ngữ',
  'settings.languageHint': 'Chọn ngôn ngữ của ứng dụng.',
  'settings.cloud': 'Đồng bộ đám mây',
  'settings.signedInAs': 'Đã đăng nhập là',
  'settings.lastSynced': 'Đồng bộ lần cuối',
  'settings.autoSync': 'Tự động đồng bộ lên đám mây',
  'settings.autoSyncHint': 'Mỗi 5 phút khi ứng dụng đang mở',
  'settings.syncToCloud': 'Sao lưu lên mây',
  'settings.syncFromCloud': 'Tải từ mây về',
  'settings.logout': 'Đăng xuất',
  'settings.backupHint': 'Lưu giữ dữ liệu của bé và mở lại trên bất kỳ thiết bị nào.',
  'settings.usernamePh': 'Tên đăng nhập (a-z, 0-9, _ -)',
  'settings.codePh': 'Mã 6 chữ số',
  'settings.createAccount': 'Tạo tài khoản',
  'settings.login': 'Đăng nhập',
  'settings.app': 'Ứng dụng',
  'settings.newUpdate': 'Có bản mới',
  'settings.lastUpdated': 'Cập nhật lần cuối',
  'settings.newVersion': 'Ứng dụng có phiên bản mới rồi nè.',
  'settings.newVersionHint': 'Bấm nút bên dưới để cập nhật nhé.',
  'settings.checking': 'Đang kiểm tra…',
  'settings.updated': 'Xong rồi! Đang tải lại…',
  'settings.updateFailed': 'Chưa cập nhật được, mẹ thử lại nhé',
  'settings.updateApp': 'Cập nhật ứng dụng',
  'settings.danger': 'Vùng nguy hiểm',
  'settings.dangerHint': 'Toàn bộ dữ liệu của bé, kể cả các cột mốc, sẽ bị xóa',
  'settings.reset': 'Xóa dữ liệu ứng dụng',
  'settings.resetConfirm': 'Xóa toàn bộ dữ liệu ứng dụng? Không thể hoàn tác.',
  'settings.somethingWrong': 'Có lỗi xảy ra rồi, mẹ thử lại nhé',
  'settings.accountCreated': 'Đã tạo tài khoản xong',
  'settings.signedIn': 'Đã đăng nhập',
  'settings.synced': 'Đã đồng bộ lên đám mây',
  'settings.saveQ': 'Lưu lên đám mây?',
  'settings.loadQ': 'Tải dữ liệu từ đám mây?',
  'settings.saveHint': 'Dữ liệu trên đám mây sẽ bị thay bằng dữ liệu trên thiết bị này.',
  'settings.loadHint': 'Dữ liệu trên thiết bị này sẽ bị thay bằng dữ liệu trên đám mây.',
  'settings.cancel': 'Hủy',
  'settings.save': 'Lưu',
  'settings.load': 'Tải',
  'settings.syncData': 'Đồng bộ dữ liệu',
  'settings.syncDataHint': 'Dữ liệu trên đám mây và trên thiết bị này khác nhau. Hãy chọn bên cần giữ; bên còn lại sẽ bị thay thế.',
  'settings.notNow': 'Để sau nhé',
};

// each area module holds its own en/vi pair: both must have the same keys (checked by defineStrings)
const modules = [ui1, ui2, aiStrings, d4, d5, d6];
const en = Object.assign({}, baseEn, ...modules.map(m => m.en)) as typeof baseEn & typeof ui1.en & typeof ui2.en & typeof aiStrings.en & typeof d4.en & typeof d5.en & typeof d6.en;
const vi: Record<keyof typeof en, string> = Object.assign({}, baseVi, ...modules.map(m => m.vi));

export type UiKey = keyof typeof en;

const dict = { en, vi };

export function translate(lang: Lang, key: UiKey, vars?: Record<string, string | number>): string {
  const s = dict[lang][key];
  return vars ? s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? '')) : s;
}
