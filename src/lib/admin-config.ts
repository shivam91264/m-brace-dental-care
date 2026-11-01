export type Field = { key: string; label: string; type?: string; options?: string[]; required?: boolean };
export type Module = { table: 'services'|'dentists'|'testimonials'|'gallery_images'|'blog_posts'|'faqs'|'appointments'|'patients'|'enquiries'|'profiles'; label: string; title: string; fields: Field[]; create?: boolean; roles: string[] };
const content = ['super_admin','admin','content_manager'];
const ops = ['super_admin','admin','receptionist'];
const f = (key:string,label:string,type='text',required=false):Field => ({key,label,type,required});
export const MODULES: Record<string,Module> = {
 services:{table:'services',title:'Services',label:'title',roles:content,create:true,fields:[f('title','Title','text',true),f('slug','URL name','text',true),f('image_url','Image','image'),f('short_description','Summary','textarea'),f('description','Description','textarea'),f('price','Price'),f('duration','Duration'),f('published','Published','checkbox'),f('featured','Featured','checkbox'),f('sort_order','Display order','number')]},
 dentists:{table:'dentists',title:'Dentists',label:'name',roles:content,create:true,fields:[f('name','Name','text',true),f('photo_url','Photograph','image'),f('designation','Designation'),f('qualifications','Qualifications'),f('specialization','Specialization'),f('bio','Biography','textarea'),f('languages','Languages'),f('consultation_hours','Consultation hours'),f('user_id','Assigned staff account ID'),f('published','Published','checkbox'),f('featured','Featured','checkbox'),f('sort_order','Display order','number')]},
 testimonials:{table:'testimonials',title:'Testimonials',label:'name',roles:content,create:true,fields:[f('name','Display name','text',true),f('content','Review','textarea',true),f('rating','Rating','number'),f('review_date','Date','date'),{key:'status',label:'Approval',options:['pending','approved','rejected']},f('published','Published','checkbox'),f('featured','Featured','checkbox'),f('sort_order','Display order','number')]},
 gallery:{table:'gallery_images',title:'Gallery',label:'title',roles:content,create:true,fields:[f('title','Title','text',true),f('alt','Image description','text',true),f('image_url','Image','image',true),{key:'category',label:'Category',options:['clinic','team','facilities','before-after']},f('consent_confirmed','Patient consent confirmed','checkbox'),f('published','Published','checkbox'),f('sort_order','Display order','number')]},
 blog:{table:'blog_posts',title:'Blog',label:'title',roles:content,create:true,fields:[f('title','Title','text',true),f('slug','URL name','text',true),f('excerpt','Summary','textarea'),f('content','Article','textarea',true),f('cover_image','Cover image','image'),f('published','Published','checkbox'),f('published_at','Publication date','datetime-local')]},
 faqs:{table:'faqs',title:'FAQs',label:'question',roles:content,create:true,fields:[f('question','Question','text',true),f('answer','Answer','textarea',true),f('published','Published','checkbox'),f('sort_order','Display order','number')]},
 appointments:{table:'appointments',title:'Appointments',label:'name',roles:[...ops,'dentist'],fields:[f('name','Patient'),f('email','Email','email'),f('phone','Phone'),f('appointment_date','Date','date'),f('start_time','Time','time'),{key:'status',label:'Status',options:['pending','confirmed','completed','cancelled','rejected','no_show']},f('message','Patient message','textarea'),f('admin_notes','Staff notes','textarea')]},
 patients:{table:'patients',title:'Patients',label:'name',roles:[...ops,'dentist'],fields:[f('name','Name'),f('email','Email','email'),f('phone','Phone')]},
 enquiries:{table:'enquiries',title:'Enquiries',label:'name',roles:ops,fields:[f('name','Name'),f('email','Email','email'),f('phone','Phone'),f('message','Message','textarea'),{key:'status',label:'Status',options:['new','in_progress','resolved']},f('notes','Staff notes','textarea')]},
 users:{table:'profiles',title:'Users',label:'full_name',roles:['super_admin'],fields:[f('full_name','Name'),f('email','Email','email'),{key:'status',label:'Account status',options:['pending','approved','rejected','suspended']}]},
};
export function canManage(roles:string[],module:Module){return roles.some(r=>module.roles.includes(r));}
export function canDelete(roles:string[],module:Module,row:Record<string,unknown>){
 if(module.table==='patients') return false;
 if(module.table==='appointments') return roles.some(r=>['super_admin','admin'].includes(r)) && ['cancelled','rejected'].includes(String(row['status']));
 if(module.table==='profiles') return roles.includes('super_admin');
 if(module.table==='enquiries') return roles.some(r=>['super_admin','admin'].includes(r));
 return roles.some(r=>content.includes(r));
}
