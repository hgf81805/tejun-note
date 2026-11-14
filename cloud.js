/* Supabase connection. Only the public publishable key belongs in config.js. */
const cloudClient = TejunSupabase.createClient(TEJUN_CONFIG.url, TEJUN_CONFIG.publishableKey, {
  auth: { storageKey: 'tejun-note-auth-v1', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});
const cloud = {
  user: null,
  async list() {
    const { data, error } = await cloudClient.from('tejun_documents').select('*').order('updated_at', {ascending:false});
    if (error) throw error;
    return data.map(r=>({id:r.id,title:r.title,category:r.category,description:r.description,steps:r.steps,stepDetails:r.step_details,fav:r.favorite,date:r.updated_at.slice(0,10),revision:r.revision}));
  },
  payload(doc) { return {owner_id:this.user.id,id:doc.id,title:doc.title,category:doc.category,description:doc.description,steps:doc.steps,step_details:doc.stepDetails||[],favorite:!!doc.fav}; },
  async write(doc, isNew) {
    if (!this.user) throw new Error('ログインしてください。');
    const row = {...this.payload(doc),updated_at:new Date().toISOString(),revision:isNew?1:doc.revision+1};
    let request = isNew ? cloudClient.from('tejun_documents').insert(row) : cloudClient.from('tejun_documents').update(row).eq('owner_id',this.user.id).eq('id',doc.id).eq('revision',doc.revision);
    const {data,error} = await request.select().single();
    if(error) {if(error.code==='PGRST116')throw new Error('別の画面で更新されています。「再読み込み」後に編集し直してください。'); throw error;}
    return {...doc,revision:data.revision,date:data.updated_at.slice(0,10)};
  },
  async importDocs(items) {
    if(!this.user)throw new Error('ログインしてください。');
    const {error}=await cloudClient.from('tejun_documents').upsert(items.map(d=>this.payload(d)),{onConflict:'owner_id,id',ignoreDuplicates:true});
    if(error)throw error;
  }
};
