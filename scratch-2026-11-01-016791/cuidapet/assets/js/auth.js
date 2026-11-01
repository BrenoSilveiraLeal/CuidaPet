/**
 * Login e armazenamento por usuário.
 * - Com Firebase configurado (config.js): login com Google e dados no Firestore (users/{uid}).
 * - Sem configuração: contas locais e dados no localStorage deste navegador.
 * A conta de demonstração é sempre local.
 */
(function () {
  const cfg = window.CUIDAPET_FIREBASE;
  const configured = !!(cfg && cfg.apiKey && window.firebase);
  let fb = null;
  if (configured) {
    firebase.initializeApp(cfg);
    fb = { auth: firebase.auth(), db: firebase.firestore() };
  }

  const SESSION = 'cuidapet-session';
  const DATA = (uid) => `cuidapet-data-${uid}`;
  const local = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* cheio ou bloqueado */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignora */ } },
  };
  const isCloud = (uid) => configured && uid && uid !== 'demo' && !uid.startsWith('local-');

  let listener = () => {};
  const fromFirebase = (u) => ({ uid: u.uid, name: u.displayName || '', email: u.email || '', photo: u.photoURL || null, provider: 'google' });

  const Auth = {
    configured,
    onError: null,

    init(cb) {
      listener = cb;
      if (configured) {
        fb.auth.getRedirectResult().catch((e) => Auth.onError && Auth.onError(e));
        fb.auth.onAuthStateChanged((u) => cb(u ? fromFirebase(u) : local.get(SESSION)));
      } else {
        cb(local.get(SESSION));
      }
    },

    async signInGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await fb.auth.signInWithPopup(provider);
      } catch (e) {
        if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) {
          return fb.auth.signInWithRedirect(provider);
        }
        throw e;
      }
    },

    signInLocal(user) {
      local.set(SESSION, user);
      listener(user);
    },

    async signOut() {
      local.del(SESSION);
      if (configured && fb.auth.currentUser) await fb.auth.signOut();
      else listener(null);
    },
  };

  let timer = null;
  let pending = null;
  const flush = () => {
    if (!pending) return;
    const { uid, state } = pending;
    pending = null;
    local.set(DATA(uid), state);
    if (isCloud(uid)) {
      fb.db.collection('users').doc(uid)
        .set({ json: JSON.stringify(state), updatedAt: firebase.firestore.FieldValue.serverTimestamp() })
        .catch((e) => Auth.onError && Auth.onError(e));
    }
  };

  const Store = {
    async load(uid) {
      if (isCloud(uid)) {
        try {
          const snap = await fb.db.collection('users').doc(uid).get();
          if (snap.exists) return JSON.parse(snap.data().json);
          return null;
        } catch (e) {
          if (Auth.onError) Auth.onError(e);
          return local.get(DATA(uid));
        }
      }
      return local.get(DATA(uid));
    },
    save(uid, state) {
      pending = { uid, state };
      clearTimeout(timer);
      timer = setTimeout(flush, 400);
    },
    async remove(uid) {
      pending = null;
      clearTimeout(timer);
      local.del(DATA(uid));
      if (isCloud(uid)) await fb.db.collection('users').doc(uid).delete();
    },
  };

  window.addEventListener('beforeunload', flush);
  window.CPAuth = Auth;
  window.CPStore = Store;
})();
