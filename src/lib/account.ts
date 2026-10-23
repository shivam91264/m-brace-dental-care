import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export const accountQuery = queryOptions({queryKey:['account'],queryFn:async()=>{
 const {data:{user},error}=await supabase.auth.getUser();
 if(error||!user) return null;
 const [p,r]=await Promise.all([supabase.from('profiles').select('*').eq('id',user.id).single(),supabase.from('user_roles').select('role').eq('user_id',user.id)]);
 if(p.error||r.error) throw p.error||r.error;
 return {user,profile:p.data,roles:(r.data??[]).map(x=>x.role)};
},staleTime:0});
