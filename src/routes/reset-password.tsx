import {createFileRoute} from "@tanstack/react-router";
import {AuthForm} from "@/components/admin/AuthForm";
export const Route=createFileRoute("/reset-password")({head:()=>({meta:[{title:"Reset Password | M'brace Dental Clinic"},{name:"description",content:"Reset Password for M'brace Dental Clinic staff."},{property:"og:title",content:"Reset Password | M'brace"},{property:"og:description",content:"Secure clinic staff account access."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"},{name:"robots",content:"noindex"}]}),component:()=> <AuthForm mode="reset"/>});
