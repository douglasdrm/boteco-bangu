// Boteco Bangu - Supabase Configuration
// Conexão com o banco de dados oficial do Supabase.

const SUPABASE_URL = "https://dhgfmfcupkysntxphepn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZ2ZtZmN1cGt5c250eHBoZXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NzUyMTYsImV4cCI6MjA5MjU1MTIxNn0.ahIgwSOq16X4dQBUDvSmiKUVgLl8E835EGRP4Wnxwyg";

// Inicializa o cliente do Supabase usando a biblioteca injetada via CDN no HTML
let supabaseClient = null;

if (typeof supabase !== 'undefined') {
    if (SUPABASE_URL !== "" && SUPABASE_ANON_KEY !== "") {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn("Supabase: Por favor, insira as credenciais de URL e Anon Key corretas em 'js/supabase-config.js'.");
    }
} else {
    console.error("Supabase: A biblioteca do Supabase não foi carregada no documento HTML.");
}
