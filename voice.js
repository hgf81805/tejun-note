/* Browser speech recognition: Japanese dictation, never on password/email fields. */
const VoiceInput = (() => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const mic = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/></svg>';
  let active = null;
  function message(text) { const help=document.getElementById('voice-help'); if(help){help.textContent=text;help.setAttribute('role','status');} }
  function finish(state) {
    if(active!==state)return;
    state.field.readOnly=state.readOnly;
    state.button.classList.remove('recording');state.button.setAttribute('aria-pressed','false');
    state.button.innerHTML=mic+'<span>音声入力</span>';
    active=null;
    if(!state.error)message(Recognition?'マイクを押して話すと入力できます。':'音声入力は対応ブラウザのChromeやEdgeでご利用ください。');
  }
  function stop() { if(!active)return;const state=active;active=null;state.field.readOnly=state.readOnly;state.button.classList.remove('recording');state.button.setAttribute('aria-pressed','false');state.button.innerHTML=mic+'<span>音声入力</span>';try{state.recognition.abort()}catch{} }
  function start(field,button) {
    if(active?.button===button){try{active.recognition.stop()}catch{stop()}return;}
    stop();
    if(!Recognition){message('音声入力は対応ブラウザのChromeやEdgeでご利用ください。');return;}
    const recognition=new Recognition();
    const state={recognition,field,button,readOnly:field.readOnly,error:false};active=state;
    recognition.lang='ja-JP';recognition.continuous=true;recognition.interimResults=true;
    let prefix=field.value,finalText='';
    field.readOnly=true;button.classList.add('recording');button.setAttribute('aria-pressed','true');button.innerHTML='<span class="record-dot"></span><span>停止</span>';message('聞き取り中… 終わったら「停止」');
    recognition.onresult=e=>{
      if(active!==state||!field.isConnected)return;
      let interim='';
      for(let i=e.resultIndex;i<e.results.length;i++){if(e.results[i].isFinal)finalText+=e.results[i][0].transcript;else interim+=e.results[i][0].transcript;}
      if(finalText){const separator=prefix?(field.tagName==='TEXTAREA'?'\n':' '):'';let text=prefix+separator+(field.tagName==='TEXTAREA'?finalText.replace(/改行/g,'\n'):finalText);if(field.maxLength>0)text=text.slice(0,field.maxLength);field.value=text;field.dispatchEvent(new Event('input',{bubbles:true}));}
      message(interim?'聞き取り中：'+interim:'聞き取り中… 終わったら「停止」');
    };
    recognition.onerror=e=>{if(active!==state)return;state.error=true;const reasons={'not-allowed':'マイクが許可されていません。ブラウザのサイト設定で許可してください。','service-not-allowed':'音声入力サービスを利用できません。ChromeやEdgeでお試しください。','audio-capture':'マイクが見つかりません。接続を確認してください。','no-speech':'音声を検出できませんでした。もう一度マイクを押してください。','network':'音声認識に接続できません。通信を確認してください。'};message(reasons[e.error]||'音声入力を終了しました。もう一度お試しください。');try{recognition.abort()}catch{}finish(state)};
    recognition.onend=()=>finish(state);
    try{recognition.start()}catch{state.error=true;message('音声入力を開始できませんでした。もう一度お試しください。');finish(state)}
  }
  function install(root) {
    root.querySelectorAll('#title, #description, .step-title-input, .step-body-input, .step-note-input, .step-check-input').forEach(field=>{
      if(field.dataset.voiceReady)return;field.dataset.voiceReady='true';
      const button=document.createElement('button');button.type='button';button.className='voice-button';button.innerHTML=mic+'<span>音声入力</span>';button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',(field.closest('label')?.childNodes[0]?.textContent?.trim()||({title:'タイトル',description:'概要'}[field.id])||'この欄')+'を音声入力');
      button.onclick=e=>{e.preventDefault();start(field,button)};field.insertAdjacentElement('afterend',button);
      if(!Recognition){button.disabled=true;button.title='このブラウザは音声入力に対応していません';}
    });
    message(Recognition?'マイクを押して話すと入力できます。音声はブラウザの音声認識サービスで処理されます。':'音声入力は対応ブラウザのChromeやEdgeでご利用ください。');
  }
  return {install,stop};
})();
