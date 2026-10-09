import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, CloudDownload, CloudUpload, LogOut } from 'lucide-react';
import { useApp } from '../../context/appStateContext';
import { fetchCloud, getAccount, getLastPush, isAuto, login, logout, pull, push, register, sameAsLocal, setAuto, sync } from '../../lib/cloudSync';

type UpdateStatus = 'idle' | 'checking' | 'updated' | 'error';

export function SettingsScreen() {
  const { dispatch } = useApp();
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [hasNewVersion, setHasNewVersion] = useState(false);
  const [toast, setToast] = useState('');
  const [account, setAccount] = useState(getAccount);
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [syncError, setSyncError] = useState('');
  const [syncBusy, setSyncBusy] = useState(false);
  const [lastPush, setLastPush] = useState(getLastPush);
  const [confirmSync, setConfirmSync] = useState<'push' | 'pull' | null>(null);
  const [afterLogin, setAfterLogin] = useState(false);
  const [auto, setAutoState] = useState(isAuto);

  useEffect(() => {
    fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.buildTime !== __BUILD_TIME__) setHasNewVersion(true); })
      .catch(() => {});
  }, []);

  async function handleUpdate() {
    if (!('serviceWorker' in navigator)) return;
    setUpdateStatus('checking');
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(key => caches.delete(key)));
      await navigator.serviceWorker.register('/sw.js');
      setUpdateStatus('updated');
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setUpdateStatus('error');
      setTimeout(() => setUpdateStatus('idle'), 3000);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  }

  async function runSync(action: () => Promise<void>) {
    setSyncBusy(true);
    setSyncError('');
    try {
      await action();
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setSyncBusy(false);
    }
  }

  const credentialsValid = /^[a-z0-9_-]{3,32}$/.test(username) && /^\d{6}$/.test(code);

  const handleRegister = () => runSync(async () => {
    await register(username, code);
    setAccount(getAccount());
    setCode('');
    showToast('Account created');
  });

  const handleLogin = () => runSync(async () => {
    await login(username, code);
    setAccount(getAccount());
    setCode('');
    const { data: cloud } = await fetchCloud();
    if (Object.keys(cloud).length > 0 && !sameAsLocal(cloud)) {
      setAfterLogin(true); // both sides have different data: let the user choose
      return;
    }
    await sync(); // cloud empty (this device becomes the source) or identical
    setLastPush(getLastPush());
    showToast('Signed in');
  });

  const handlePush = () => runSync(async () => {
    setAfterLogin(false);
    setConfirmSync(null);
    await push();
    setLastPush(getLastPush());
    showToast('Synced to cloud');
  });

  const handlePull = () => runSync(async () => {
    setConfirmSync(null);
    await pull(); // reloads the page on success
  });

  function toggleAuto() {
    setAuto(!auto);
    setAutoState(!auto);
  }

  function handleLogout() {
    logout();
    setAccount(null);
    setLastPush(null);
  }

  function handleReset() {
    if (!confirm('Reset all app data? This cannot be undone.')) return;
    localStorage.removeItem('baby-day:profile');
    localStorage.removeItem('baby-day:achieved-milestones');
    localStorage.removeItem('baby-day:growth-entries');
    window.location.href = '/';
  }

  const screen = (
    <div className="fade-in px-4 pt-6 pb-8">
      <h1 className="text-2xl font-extrabold text-app-text mb-6">Settings</h1>

      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 space-y-3">
        <div>
          <p className="font-bold text-app-text">Baby Profile</p>
          <p className="text-xs text-textMuted mt-0.5">Used to personalize guidance in Ask AI.</p>
        </div>
        <button
          onClick={() => dispatch({ type: 'SET_PAGE', payload: 'babyprofile' })}
          className="w-full flex items-center justify-between py-2.5 px-3 text-sm font-bold rounded-xl border-2 border-peachLight text-app-text active:bg-cream transition-all"
        >
          Edit baby profile
          <ChevronRight size={18} strokeWidth={2.2} className="text-textMuted" />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <p className="font-bold text-app-text mb-1">Cloud sync</p>
        {account ? (
          <div className="space-y-3">
            <p className="text-sm text-textMuted">
              Signed in as <strong className="text-app-text">{account.username}</strong>
              {lastPush && <><br />Last synced {new Date(lastPush).toLocaleString()}</>}
            </p>
            <button
              role="switch"
              aria-checked={auto}
              onClick={toggleAuto}
              className="w-full flex items-center justify-between py-2 text-sm font-bold text-app-text"
            >
              <span className="text-left">
                Auto sync to cloud
                <span className="block text-xs font-normal text-textMuted">Every 5 minutes while the app is open</span>
              </span>
              <span className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors ${auto ? 'bg-peach' : 'bg-gray-300'}`}>
                <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${auto ? 'translate-x-5' : ''}`} />
              </span>
            </button>
            {syncError && <p className="text-red-500 text-xs">{syncError}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmSync('push')}
                disabled={syncBusy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-bold rounded-xl border-2 border-peachLight text-app-text active:bg-cream disabled:opacity-40"
              >
                <CloudUpload size={16} strokeWidth={2.2} />
                Sync to cloud
              </button>
              <button
                onClick={() => setConfirmSync('pull')}
                disabled={syncBusy}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-bold rounded-xl border-2 border-peachLight text-app-text active:bg-cream disabled:opacity-40"
              >
                <CloudDownload size={16} strokeWidth={2.2} />
                Sync from cloud
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-bold text-textMuted"
            >
              <LogOut size={16} strokeWidth={2.2} />
              Log out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-textMuted mb-1">Back up your data and restore it on any device.</p>
            <input
              value={username}
              onChange={e => { setUsername(e.target.value.toLowerCase()); setSyncError(''); }}
              placeholder="Username (a-z, 0-9, _ -)"
              autoCapitalize="none"
              autoCorrect="off"
              maxLength={32}
              className="w-full text-sm bg-cream rounded-xl px-3 py-2 text-app-text border border-peachLight placeholder:text-textMuted/50"
            />
            <input
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setSyncError(''); }}
              placeholder="6-digit code"
              inputMode="numeric"
              maxLength={6}
              type="password"
              className="w-full text-sm bg-cream rounded-xl px-3 py-2 text-app-text border border-peachLight placeholder:text-textMuted/50"
            />
            {syncError && <p className="text-red-500 text-xs">{syncError}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleRegister}
                disabled={!credentialsValid || syncBusy}
                className="flex-1 py-2 text-sm font-bold rounded-xl bg-peach text-white active:opacity-80 disabled:opacity-40"
              >
                Create account
              </button>
              <button
                onClick={handleLogin}
                disabled={!credentialsValid || syncBusy}
                className="flex-1 py-2 text-sm font-bold rounded-xl border-2 border-peachLight text-app-text active:bg-cream disabled:opacity-40"
              >
                Log in
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-app-text">App</p>
          {hasNewVersion && (
            <span className="text-xs font-bold bg-peach text-white px-2 py-0.5 rounded-full">
              New update
            </span>
          )}
        </div>
        <p className="text-xs text-textMuted mb-3">
          Last updated {new Date(__BUILD_TIME__).toLocaleString()}
        </p>
        {hasNewVersion && (
          <div className="bg-orange-50 border border-peachLight rounded-xl px-3 py-2.5 mb-3">
            <p className="text-sm text-app-text leading-snug">
              A newer version of the app is ready.<br />
              <span className="text-textMuted">Tap below to refresh and get it.</span>
            </p>
          </div>
        )}
        <button
          id="update-app-btn"
          onClick={handleUpdate}
          disabled={updateStatus === 'checking' || updateStatus === 'updated'}
          className={`text-sm font-bold rounded-xl px-4 py-2 transition-all disabled:opacity-60 ${
            hasNewVersion
              ? 'bg-peach text-white border-2 border-peach active:opacity-80'
              : 'text-app-text border-2 border-peachLight active:bg-cream'
          }`}
        >
          {updateStatus === 'checking' && 'Checking…'}
          {updateStatus === 'updated' && 'Updated! Reloading…'}
          {updateStatus === 'error' && 'Update failed — try again'}
          {updateStatus === 'idle' && 'Update app'}
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
        <p className="font-bold text-red-500 mb-1">Danger zone</p>
        <p className="text-sm text-textMuted mb-3">This will erase all data including milestones</p>
        <button
          onClick={handleReset}
          className="text-red-500 text-sm font-bold border border-red-200 rounded-xl px-4 py-2 active:bg-red-50"
        >
          Reset app data
        </button>
      </div>

    </div>
  );

  const overlays = (
    <>
      {toast && (
        <div className="fixed bottom-[7.5rem] left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}
      {confirmSync && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl -mt-20">
            <p className="font-bold text-app-text mb-1">
              {confirmSync === 'push' ? 'Save to cloud?' : 'Load cloud data?'}
            </p>
            <p className="text-sm text-textMuted mb-4">
              {confirmSync === 'push'
                ? 'The data saved in the cloud will be replaced with the data on this device.'
                : 'Your data on this device will be replaced with the data saved in the cloud.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmSync(null)}
                className="flex-1 py-2 text-sm font-bold rounded-xl border-2 border-peachLight text-textMuted"
              >
                Cancel
              </button>
              <button
                onClick={confirmSync === 'push' ? handlePush : handlePull}
                className="flex-1 py-2 text-sm font-bold rounded-xl bg-peach text-white"
              >
                {confirmSync === 'push' ? 'Save' : 'Load'}
              </button>
            </div>
          </div>
        </div>
      )}
      {afterLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl -mt-20">
            <p className="font-bold text-app-text mb-1">Sync your data</p>
            <p className="text-sm text-textMuted mb-4">
              Your cloud data and this device's data are different. Choose which one to keep; the other side will be replaced.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => { setAfterLogin(false); handlePull(); }}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-bold rounded-xl bg-peach text-white"
              >
                <CloudDownload size={16} strokeWidth={2.2} />
                Sync from cloud
              </button>
              <button
                onClick={handlePush}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-bold rounded-xl border-2 border-peachLight text-app-text"
              >
                <CloudUpload size={16} strokeWidth={2.2} />
                Sync to cloud
              </button>
              <button
                onClick={() => setAfterLogin(false)}
                className="w-full py-2 text-sm font-bold text-textMuted"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {screen}
      {createPortal(overlays, document.body)}
    </>
  );
}
