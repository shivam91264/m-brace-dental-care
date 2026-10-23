import {createFileRoute} from "@tanstack/react-router";
import {AuthForm} from "@/components/admin/AuthForm";
export const Route=createFileRoute("/auth")({head:()=>({meta:[{title:"Staff Login | M'brace Dental Clinic"},{name:"description",content:"Staff Login for M'brace Dental Clinic staff."},{property:"og:title",content:"Staff Login | M'brace"},{property:"og:description",content:"Secure clinic staff account access."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"},{name:"robots",content:"noindex"}]}),component:()=> <AuthForm mode="login"/>});
