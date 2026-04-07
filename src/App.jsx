import React, { useState, useEffect } from 'react';
import {
    Heart, History, ArrowRight, Zap, Smile, Meh, Frown, CheckCircle2, Sparkles, Quote, FlaskConical, ChevronDown, ChevronUp
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyANNnwM7pN7o84xe46Qa1Ee-fEx-fZoy7s",
    authDomain: "manual-das-gostosas.firebaseapp.com",
    projectId: "manual-das-gostosas",
    storageBucket: "manual-das-gostosas.firebasestorage.app",
    messagingSenderId: "162334130246",
    appId: "1:162334130246:web:a33555e4e06ce3f9a9ca47",
    measurementId: "G-L5111B5YFE"
};

let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (e) { console.error("Erro na inicialização do Firebase", e); }

const appId = "manual-das-gostosas-v1";

const cn = (...classes) => classes.filter(Boolean).join(' ');

const PRODUTOS_MANUAL = [
    { id: 1, nome: "Vaselina Vasenol", tagline: "O segredo mais antigo e mais eficaz.", dica: "Besunta tudo mesmo, sem frescura! Lábios genitais, bumbum lá dentro, cotovelo...", fofoca: "Era segredo de triatleta pra não assar, virou segredo de gostosa.", ciencia: "Vaselina é petrolato purificado: cria uma barreira protetora que reduz a perda de água e diminui a inflamação." },
    { id: 2, nome: "Óleo de Argan | Josie Maran", tagline: "Luxo que vale cada gota.", dica: "Uma gota espalhada nas áreas mais secas ou quando o ar condicionado gritar socorro.", fofoca: "Não é luxo performático, é luxo funcional.", ciencia: "Riquíssimo em Vitamina E e antioxidantes. Age na homeostase, sinalizando ao hipotálamo que o corpo está seguro." },
    { id: 3, nome: "Giovanna Baby Rosa", tagline: "Meu desodorante de paz.", dica: "Ideal para dias de muita pressão. Protege o dia todo sem cheiro invasivo.", fofoca: "Ganhou medalha de ouro no meu teste de 4h de bike.", ciencia: "O cheiro delicado reduz a ativação da amígdala cerebral, virando um atalho emocional que barra o estresse." },
    { id: 4, nome: "Geleia Real (In Natura)", tagline: "Elixir natural ancestral.", dica: "Uma pontinha de colher de manhã ou como sérum antes de dormir.", fofoca: "O gosto é péssimo, mas a pele acorda majestosa.", ciencia: "Contém vitaminas complexo B e aminoácidos. Acelera a regeneração celular e regula a fluência cognitiva." },
    { id: 5, nome: "Coco Mademoiselle | Chanel", tagline: "Minha assinatura de poder elegante.", dica: "Use em dias de reuniões importantes ou quando for dormir sozinha.", fofoca: "Tem patchouli, fixa muito. Cheiro de mulher impecável.", ciencia: "O olfato vai direto pro sistema límbico. A sensação de poder altera a postura corporal, aumentando neurotransmissores de domínio." },
    { id: 6, nome: "Bepantol Baby", tagline: "O truque que ninguém conta.", dica: "Camada na boca rachada, contorno do bumbum e nos braços para dormir.", fofoca: "Esfregue devagar até ficar transparente.", ciencia: "O Dexpantenol (pró-vitamina B5) acelera a regeneração celular durante o sono e ativa mecanorreceptores ligados ao sistema parassimpático." },
    { id: 7, nome: "Amber Romance (Creme)", tagline: "Momento de flerte comigo mesma.", dica: "Deixe na gaveta do trabalho. Sentiu-se pra baixo? Passa.", fofoca: "Segredo das triatletas. Ninguém te rouba de si mesma.", ciencia: "A baunilha aciona memórias de conforto, liberando dopamina (motivação) que preserva sua energia mental." },
    { id: 8, nome: "NIVEA Flor de Laranjeira", tagline: "Conforto prático com óleo de Jojoba.", dica: "Hidratante pra 'ir pro mundo'. Saiu do banho, passou, absorveu.", fofoca: "Um clássico baratinho que cumpre tudo que promete.", ciencia: "O óleo de jojoba possui afinidade química com o sebo natural da pele humana, criando fluência cognitiva e reduzindo o esforço mental." },
    { id: 9, nome: "Effaclar Gel Concentrado", tagline: "A faxina técnica inteligente.", dica: "Para aquela 'limpeza premium' no banho quente quando a pele pede socorro.", fofoca: "Validado por dermato desde a adolescência.", ciencia: "Desobstrui poros. A limpeza física gera um sinal de segurança pro cérebro, baixando a carga alostática." },
    { id: 10, nome: "Pré-treino Capilar | Cris Dios", tagline: "Protetor solar invisível do fio.", dica: "Passe antes de prender o cabelo para trabalhar ou treinar.", fofoca: "Assuma a mulher-maravilha: protege do suor e ar condicionado.", ciencia: "Elimina a fricção e preserva o foco. Cuidar de dano mecânico extremo é gasto mental desnecessário." },
    { id: 11, nome: "Studio Finish Concealer | MAC", tagline: "Meu corretivo de guerra.", dica: "Dura a vida toda. Pressione suavemente com os dedos, não esfregue.", fofoca: "Custa caro mas não te abandona no meio do dia.", ciencia: "Garante durabilidade térmica. Ao disfarçar a exaustão física, você aumenta a sua 'fluência cognitiva' visual." },
    { id: 12, nome: "Protetor Solar Bastão | Pink Cheeks", tagline: "Escudo do triathlon pra vida real.", dica: "Uso a cor 21km como base. Proteção absoluta com toque sequinho.", fofoca: "A proteção é o maior ato de amor anti-idade.", ciencia: "Diminui a inflamação tecidual diária. Imunidade alta significa menos oscilações no seu humor basal." },
    { id: 13, nome: "Listerine Melancia e Hortelã", tagline: "O melhor sabor, sem discussão.", dica: "Bochecho diário para sensação de limpeza absoluta.", fofoca: "Frescor de boca de mulher absurdamente higiênica.", ciencia: "O sabor agradável diminui o atrito do hábito, reduzindo o custo energético para o cérebro manter o ritual." },
    { id: 14, nome: "Dersani Regenerador", tagline: "O recuperador cutâneo extremo.", dica: "Bunda, braços, joelhos. SOS pra super-hidratação noturna.", fofoca: "Fez desaparecer queimadura de 3º grau.", ciencia: "Rico em AGEs e vitaminas A e E, entra na cadeia celular forçando a reorganização de colágeno." },
    { id: 15, nome: "Neostrata Oil Control", tagline: "O controle absoluto de narrativa.", dica: "No banho, antes de reuniões que decidem seu mês.", fofoca: "Produto profissional pra performar.", ciencia: "Possui ácido glicólico. Uniformidade estética gera sensação de previsibilidade e precisão." },
    { id: 16, nome: "Óleo de Buriti | Pira", tagline: "O reset corporal da executiva.", dica: "Massageie os próprios pés após um dia intenso.", fofoca: "Ritual silencioso para dizer ao corpo: você não é só uma ferramenta.", ciencia: "Ativa a oxitocina e endorfinas pelo sistema parassimpático, derrubando o cortisol diário." },
    { id: 17, nome: "Geleia Esfoliante | L'Occitane", tagline: "Meu spa revigorante de sauna.", dica: "Fricção delicada no chuveiro. Limpa o peso da semana.", fofoca: "A textura é divina e você sai com a pele viva.", ciencia: "Estimula a circulação periférica. A fricção manda um sinal sensorial pro sistema límbico que cancela o estresse." },
    { id: 18, nome: "Amber Romance (Bodysplash)", tagline: "O foguinho secreto das 15h.", dica: "Energia corporativa caiu? Dê uma borrifada no ar.", fofoca: "Sentir perfumada mesmo afogada em planilhas.", ciencia: "Inalar notas quentes recarrega os níveis de dopamina, diminuindo a procrastinação." },
    { id: 19, nome: "Óleo de Banho Amêndoa | L'Occitane", tagline: "Rito premium de transição.", dica: "Em contato com a água vira um leite. Use esponjinha fofa.", fofoca: "Desliga a executiva em chamas.", ciencia: "Interrompe a vigília neurológica intensa. O cérebro adora transições bem demarcadas." },
    { id: 20, nome: "Avatim Verbena e Bambu", tagline: "O banho saideira pra dormir.", dica: "Passe sem dó e vá dormir ou curtir.", fofoca: "Sensação de produto de US$200, mas paguei pouco.", ciencia: "A Verbena ativa o foco e cria percepção de ordem; o Bambu traz leveza à psique." }
];

const FRASES_DE_PODER = [
    "O dia de hoje não precisa ser extraordinário para ser maravilhoso", "Tem beleza suficiente acontecendo agora: você só precisa notar",
    "A vida fica mais leve quando você para de exigir espetáculo", "Hoje já é um bom dia para viver com mais gentileza",
    "Nem todo dia muda tudo, mas todo dia pode melhorar algo", "Pequenos acertos sustentam grandes vidas",
    "O que você faz hoje já é construção", "A vida acontece enquanto você respira fundo e continua",
    "Tem coisa boa acontecendo mesmo nos dias comuns", "O simples bem vivido vira especial",
    "Você não precisa correr, pq você já está dentro da sua vida", "Tem espaço para alegria no meio do dia",
    "Um momento bom já muda o dia inteiro", "A leveza está mais perto do que parece",
    "Você pode escolher tornar o dia mais gentil", "Nem tudo precisa ser perfeito para ser bonito",
    "O hoje tem coisas boas esperando atenção", "A vida melhora quando você desacelera o olhar",
    "O que é suficiente pode ser incrível", "Você não está atrasada, você está vivendo",
    "A alegria gosta do detalhe", "E o detalhe está em todo lugar",
    "Um café quente pode ser um momento inteiro", "Um banho pode ser um recomeço",
    "Um respiro pode reorganizar tudo", "Tem beleza em fazer o básico bem",
    "O dia não precisa impressionar, só precisa ser vivido.", "O comum tem mais valor do que parece",
    "Você não precisa de muito para sentir bem", "Às vezes, basta prestar atenção",
    "A vida não está longe: ela está acontecendo agora", "O que você tem hoje já pode ser suficiente",
    "Tem mais coisa dando certo do que você percebe", "Nem todo progresso faz barulho",
    "O que cresce devagar dura mais", "Hoje já é uma oportunidade de viver melhor",
    "Um dia de cada vez funciona", "A expectativa do outro é um lugar muito desconfortável pra vc morar",
    "O tempo está do seu lado quando você respeita o seu ritmo", "Você não precisa se apressar para dar certo",
    "A calma nunca atrasou ninguém", "Viver bem é saber aproveitar o agora",
    "Você pode gostar mais do seu próprio dia", "A beleza das coisas está no espírito de quem as contempla",
    "Se Deus foi fiel no ontem, por que temer o amanhã?", "Nem tudo precisa ser resolvido para você ficar bem",
    "Algumas coisas já estão bem", "Você é valiosa, não se perca de novo.",
    "Tudo volta: isso te assusta ou te conforta?", "A vida dos seus sonhos precisa da sua coragem pra existir",
    "A vida não pede perfeição: ela pede presença", "A preguiça vira ânimo após um bate papo com Deus",
    "O que você vive com atenção fica melhor", "O olhar muda a experiência",
    "É o seu jardim, diva! Você escolhe o que cresce", "O que falou mais alto hoje? O que você disse ou o que você fez?",
    "Pequenas escolhas criam grandes sensações", "Se você não está repetindo suas roupas, você não está criando um estilo",
    "Todo começo tem um agora", "Um bom momento puxa outro.",
    "A alegria não precisa de motivo grandioso", "Nada é de repente. Tudo é construção",
    "Nada é por acaso. Tudo é por repetição.", "Que privilégio é estar exausta por algo que você mesma escolheu pra você",
    "Seja o lugar que você gostaria que o mundo fosse", "Onde não te couberes, não te apertes.",
    "Sua fortuna está aí: nas pessoas que você ama", "Se o coração sentiu paz, a escolha foi certa",
    "Não dá pra competir com quem está se divertindo", "Importe-se mais com sua roupa do que com a opinião dos outros",
    "Nem tudo precisa ser mudar para você se sentir melhor", "Cuidar da pele ao invés de cuidar da vida dos outros",
    "Às vezes a grama do vizinho é mais verde porque é falsa", "O que é leve sustenta mais",
    "Quem subiu de escada conhece cada andar. Quem subiu de elevador só conhece o último", "Quando alguém tenta te diminuir saiba que algo em você fez ela se sentir pequena",
    "As roupas não vão mudar o mundo, as mulheres que as vestem vão", "O caminho também é a vida",
    "Troque o “o que faz você feliz”por “o que você faz feliz”", "O ego precisa da presença dos outros, a autoestima não",
    "O universo nunca vai te dar paz em algo que não é pra você", "Bendita seja a última gota que transbordou e fez você sair de onde não merecia mais ficar",
    "Não guarde nada para uma ocasião especial. Ocasião especial é cada dia que se vive. É agora", "O tranquilo também encanta",
    "O que é simples também preenche", "Se alguma coisa é de graça o produto é você",
    "O que você pediria se soubesse que a resposta seria sim?", "Não se incomode com a opinião de pessoas que você nunca seria",
    "Um dia de cada vez constrói uma vida inteira", "Faça, vão te criticar de qualquer forma",
    "A vida responde melhor à constância do que à pressa", "Reagir com luz a tudo tem sido o jeito mais belo que encontrei de encarar a vida",
    "Tem muito valor no que você já construiu até hoje", "Assuma o compromisso inegociável de gostar de si mesma",
    "Em terra de egos quem vê o outro é rei", "Você pode terminar o dia melhor do que começou",
    "Você é a única pessoa do mundo para quem você precisa ser boa o suficiente", "Cuidar-se deve ser um ato de celebrar a mulher que você é hoje",
    "Ninguém está torcendo mais por você do que a garota que você costumava ser. Continue!", "A felicidade tira fotos tremidas"
];

export default function App() {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('mood');
    const [score, setScore] = useState(3);
    const [history, setHistory] = useState([]);
    const [activeRitual, setActiveRitual] = useState(null);
    const [showMotivationBtn, setShowMotivationBtn] = useState(false);
    const [motivationQuote, setMotivationQuote] = useState(null);
    const [expandedProductInfo, setExpandedProductInfo] = useState({});

    useEffect(() => {
        if (!auth) return;
        signInAnonymously(auth);
        const unsubscribe = onAuthStateChanged(auth, setUser);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user || !db) return;
        const colRef = collection(db, 'artifacts', appId, 'users', user.uid, 'history');
        const unsubscribe = onSnapshot(colRef, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            docs.sort((a, b) => b.timestamp - a.timestamp);
            setHistory(docs);
        });
        return () => unsubscribe();
    }, [user]);

    const handleMoodSubmit = () => {
        const recommendations = [
            { title: "Ritual de UTI", steps: [PRODUTOS_MANUAL[13], PRODUTOS_MANUAL[5], PRODUTOS_MANUAL[0]], color: "text-red-600", bg: "bg-red-50", quote: "Não exija performance de um corpo exausto." },
            { title: "Ritual do Aconchego", steps: [PRODUTOS_MANUAL[18], PRODUTOS_MANUAL[3], PRODUTOS_MANUAL[2]], color: "text-orange-600", bg: "bg-orange-50", quote: "Tratar-se com doçura é o seu maior ato de rebeldia." },
            { title: "Resgate Profundo", steps: [PRODUTOS_MANUAL[16], PRODUTOS_MANUAL[15], PRODUTOS_MANUAL[6]], color: "text-rose-600", bg: "bg-rose-50", quote: "O toque com intenção muda a química do cérebro." },
            { title: "Despertar Rápido", steps: [PRODUTOS_MANUAL[7], PRODUTOS_MANUAL[12], PRODUTOS_MANUAL[17]], color: "text-violet-600", bg: "bg-violet-50", quote: "Às vezes tudo que o cérebro precisa é de um estímulo sensorial rápido." },
            { title: "Manutenção do Glow", steps: [PRODUTOS_MANUAL[8], PRODUTOS_MANUAL[11], PRODUTOS_MANUAL[19]], color: "text-pink-600", bg: "bg-pink-50", quote: "O autocuidado altera a postura sem esforço consciente." },
            { title: "Celebração Absoluta", steps: [PRODUTOS_MANUAL[4], PRODUTOS_MANUAL[14], PRODUTOS_MANUAL[1]], color: "text-fuchsia-600", bg: "bg-fuchsia-50", quote: "Sua assinatura de poder é o seu próprio respeito." }
        ];
        setActiveRitual(recommendations[score]);
        setView('ritual');
    };

    const confirmCheckIn = async () => {
        const now = new Date();
        const newEntry = {
            date: now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: now.getTime(),
            score: score
        };

        if (user && db) {
            const colRef = collection(db, 'artifacts', appId, 'users', user.uid, 'history');
            await addDoc(colRef, newEntry);
        }

        const nextCount = history.length + 1;
        if (nextCount % 3 === 0) {
            setShowMotivationBtn(true);
            setMotivationQuote(null);
        } else {
            setShowMotivationBtn(false);
            setMotivationQuote(null);
        }
        setView('history');
    };

    return (
        <div className="min-h-screen text-slate-900 flex items-center justify-center p-4 bg-gradient-to-br from-[#fff5f7] to-[#ffe4ec] font-['Plus_Jakarta_Sans']">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
                .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .glossy-card { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.5); }
                .science-expand { transition: max-height 0.4s ease-in-out, opacity 0.3s; max-height: 0; opacity: 0; overflow: hidden; }
                .science-expand.open { max-height: 500px; opacity: 1; padding-top: 1rem; }
            `}</style>

            <div className="w-full max-w-md bg-white min-h-[640px] shadow-2xl rounded-[3rem] overflow-hidden border-4 border-pink-100 flex flex-col relative">
                <header className="p-6 border-b border-pink-50 flex justify-between items-center sticky top-0 bg-white/90 z-20">
                    <div className="cursor-pointer" onClick={() => setView('mood')}>
                        <h1 className="font-black text-slate-800 text-lg leading-none">TERMÔMETRO DA AUTOESTIMA</h1>
                        <span className="text-[10px] text-pink-500 font-bold uppercase tracking-widest">O Guia Secreto</span>
                    </div>
                    <History className="w-6 h-6 text-pink-400 cursor-pointer" onClick={() => setView('history')} />
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    {view === 'mood' && (
                        <div className="space-y-8 animate-slide-up text-center">
                            <h2 className="text-3xl font-black text-slate-900 leading-tight">Como está o seu brilho hoje?</h2>
                            <div className="flex justify-between items-end gap-2 h-40 px-2">
                                {[0, 1, 2, 3, 4, 5].map((val) => (
                                    <button key={val} onClick={() => setScore(val)} className="flex-1 flex flex-col items-center group">
                                        <div className={cn("w-full rounded-2xl transition-all duration-500", score === val ? "bg-gradient-to-t from-pink-600 to-fuchsia-400" : "bg-pink-50")} style={{height: `${val * 15 + 25}%`}} />
                                        <span className={cn("mt-2 text-xs font-black", score === val ? "text-pink-600" : "text-slate-300")}>{val}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={handleMoodSubmit} className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3">Ver Meu Ritual <ArrowRight /></button>
                        </div>
                    )}

                    {view === 'ritual' && activeRitual && (
                        <div className="space-y-6 animate-slide-up">
                            <div className={cn("p-8 rounded-[2.5rem] border-2 text-center relative", activeRitual.bg)}>
                                <Quote className="absolute -top-2 -left-2 w-12 h-12 text-pink-200 opacity-30" />
                                <h2 className={cn("font-black text-2xl relative z-10", activeRitual.color)}>{activeRitual.title}</h2>
                                <p className="text-slate-700 italic font-bold relative z-10">"{activeRitual.quote}"</p>
                            </div>
                            {activeRitual.steps.map((item, idx) => (
                                <div key={idx} className="glossy-card p-6 rounded-[2rem] space-y-2 border border-white relative">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black text-slate-900 text-lg leading-tight pr-4">{item.nome}</h4>
                                        <div className="bg-pink-100 text-pink-600 w-7 h-7 rounded-full flex items-center justify-center font-black text-xsshrink-0">{idx+1}</div>
                                    </div>
                                    <p className="text-sm text-slate-600 pb-2">{item.dica}</p>
                                    <button onClick={() => setExpandedProductInfo(prev => ({...prev, [item.id]: !prev[item.id]}))} className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5"><FlaskConical className="w-3.5 h-3.5"/> Por que é bom?</button>
                                    <div className={cn("science-expand", expandedProductInfo[item.id] && "open")}>
                                        <p className="text-xs text-indigo-900 bg-indigo-50 p-3.5 rounded-xl font-medium leading-relaxed">{item.ciencia}</p>
                                    </div>
                                </div>
                            ))}
                            <button onClick={confirmCheckIn} className="w-full bg-emerald-500 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3">Tô Gostosa! <CheckCircle2/></button>
                        </div>
                    )}

                    {view === 'history' && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="text-center">
                                <h2 className="text-2xl font-black">Meu Progresso</h2>
                                <p className="text-xs text-pink-400 font-bold uppercase tracking-widest">Sua jornada de autoestima</p>
                            </div>

                            {showMotivationBtn && (
                                <button onClick={() => {setMotivationQuote(FRASES_DE_PODER[Math.floor(Math.random() * FRASES_DE_PODER.length)]); setShowMotivationBtn(false);}} className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                                    <Sparkles className="w-5 h-5" /> ME MOTIVE <Sparkles className="w-5 h-5" />
                                </button>
                            )}

                            {motivationQuote && (
                                <div className="animate-slide-up bg-slate-900 p-8 rounded-[2.5rem] text-center text-white font-bold italic text-lg shadow-xl border-4 border-pink-200 relative overflow-hidden">
                                    <Quote className="absolute -top-3 -left-2 w-16 h-16 text-pink-600 opacity-40" />
                                    <p className="relative z-10 leading-relaxed">"{motivationQuote}"</p>
                                </div>
                            )}

                            <div className="h-48 w-full bg-pink-50/20 rounded-[2.5rem] p-5 border border-pink-100">
                                {history.length >= 2 ? (
                                    <ResponsiveContainer width="100%" height="100%"><LineChart data={history.slice().reverse()}><XAxis dataKey="date" hide/><YAxis domain={[0, 5]} hide/><Line type="monotone" dataKey="score" stroke="#ec4899" strokeWidth={5} dot={{r: 5, fill: '#ec4899'}} activeDot={{r: 7}}/></LineChart></ResponsiveContainer>
                                ) : <div className="h-full flex flex-col items-center justify-center text-pink-300 font-bold text-center gap-3"><Heart className="w-8 h-8 animate-pulse"/><span className="text-sm">Faça mais {2 - history.length} registros para liberar o gráfico!</span></div>}
                            </div>

                            <div className="space-y-3.5">
                                {history.map((entry, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-white border-2 border-pink-50 rounded-[1.8rem]">
                                        <div className="flex flex-col text-[11px] font-black text-slate-400"><span>{entry.date}</span><span className="text-pink-300">{entry.time}</span></div>
                                        <div className="flex items-center gap-1.5 text-pink-500 font-black">Nota {entry.score} <Heart className="w-3.5 h-3.5 fill-current"/></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                <footer className="p-5 bg-slate-900 text-center">
                    <span className="text-[10px] text-white/70 font-black uppercase tracking-widest">TERMÔMETRO DA AUTOESTIMA</span>
                </footer>
            </div>
        </div>
    );
}
