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

// Configuração do Firebase para salvar na nuvem
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

// Utilitário para unir classes condicionalmente
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Todos os 20 produtos do Manual com fofoca e embasamento biológico/científico
const PRODUTOS_MANUAL = [
    {
        id: 1,
        nome: "Vaselina Vasenol",
        tagline: "O segredo mais antigo e mais eficaz.",
        dica: "Besunta tudo mesmo, sem frescura! Lábios genitais, bumbum lá dentro, cotovelo... perfeito para não craquelar a make e proteger de sapato chato.",
        fofoca: "Era segredo de triatleta pra não assar, virou segredo de gostosa pra brilhar e tratar a pele que pede abraço.",
        ciencia: "A neurociência do conforto puro! Vaselina é petrolato purificado: ela não apenas hidrata, ela cria uma barreira protetora implacável que reduz a perda de água e diminui a inflamação. O cérebro entende essa diminuição de fricção como redução de estresse e te devolve uma pele mais confortável e mente menos vigiante. É prevenção de desconforto disfarçada de truque de beleza."
    },
    {
        id: 2,
        nome: "Óleo de Argan | Josie Maran",
        tagline: "Luxo que vale cada gota.",
        dica: "Uma gota espalhada nas áreas mais secas (calcanhar, cotovelos) ou quando o ar condicionado gritar socorro na sua pele.",
        fofoca: "Não é luxo performático, é luxo funcional. O resultado é instantâneo e absurdo.",
        ciencia: "A ciência da barreira perfeita! Riquíssimo em Vitamina E, ácidos graxos essenciais e antioxidantes, ele atua diretamente na melhora da elasticidade e da função barreira da pele. Ao devolver conforto térmico e tátil, ele age na sua 'homeostase' (equilíbrio interno), sinalizando ao hipotálamo que o seu corpo está seguro e reduzindo a ansiedade basal."
    },
    {
        id: 3,
        nome: "Giovanna Baby Rosa",
        tagline: "Meu desodorante de paz.",
        dica: "Ideal para dias de muita pressão. Deixe no carro, na mala da academia ou no lavabo. Protege o dia todo sem cheiro invasivo.",
        fofoca: "Ganhou medalha de ouro no meu teste de 4h de bike. Feminino, abraça o corpo e cria memória de paz.",
        ciencia: "Você sabia que desodorantes muito fortes bloqueiam agressivamente com alumínio? O GB controla o odor mantendo a barreira íntegra. E tem mais: o cheiro delicado e nostálgico reduz a ativação da sua amígdala cerebral, virando um 'atalho emocional' que barra a resposta de estresse do dia a dia. É biologia do aconchego."
    },
    {
        id: 4,
        nome: "Geleia Real (In Natura)",
        tagline: "Elixir natural ancestral.",
        dica: "Uma pontinha de colher de manhã para acordar, ou passe no rosto como sérum antes de dormir. (Não usar se tiver alergia a própolis).",
        fofoca: "O gosto é péssimo, mas a pele acorda tão majestosa no dia seguinte que você vai se perdoar.",
        ciencia: "Uma super dose biológica! Contém vitaminas complexo B, aminoácidos e antioxidantes puros. Aplicada na pele, a geleia atua acelerando a regeneração celular. Ingerida, regula a fluência cognitiva e disposição. A repetição desse cuidado reforça suas conexões neurais: você está, literalmente, se tratando como a rainha que comanda sua vida."
    },
    {
        id: 5,
        nome: "Coco Mademoiselle | Chanel",
        tagline: "Minha assinatura de poder elegante.",
        dica: "Use em dias de reuniões importantes ou quando for dormir sozinha para ser cheirosa em sua própria presença.",
        fofoca: "Tem patchouli, fixa muito. Aquele cheiro de mulher impecável que não aceita migalhas.",
        ciencia: "Perfume é intervenção biológica! O olfato vai direto pro sistema límbico, que processa emoções. Borrifar Chanel não é luxo, é ancorar instantaneamente sua autoconfiança. A sensação de poder altera a sua postura corporal; e a ciência diz: postura aberta aumenta neurotransmissores de domínio e reduz a submissão social."
    },
    {
        id: 6,
        nome: "Bepantol Baby",
        tagline: "O truque que ninguém conta.",
        dica: "Camada na boca rachada, contorno do bumbum e nos braços para dormir. A pele fica uma tentação.",
        fofoca: "Esfregue devagar até ficar transparente. É para você se tratar como o 'nenê' valioso que você é.",
        ciencia: "O segredo fisiológico é o Dexpantenol (pró-vitamina B5). Ele acelera ferozmente a regeneração celular durante o sono. E tem um detalhe neurocientífico: esse processo lento de espalhar o creme ativa mecanorreceptores ligados ao sistema parassimpático, colocando o corpo no modo 'descansar e recuperar' e desarmando o estresse crônico."
    },
    {
        id: 7,
        nome: "Amber Romance (Creme)",
        tagline: "Momento de flerte comigo mesma.",
        dica: "Deixe na gaveta do trabalho. Sentiu-se pra baixo? Passa. Recebeu elogio? Passa. Entediada? Passa.",
        fofoca: "Segredo das triatletas. Ninguém vai te roubar de si mesma no meio do caos.",
        ciencia: "A neurociência do flerte interno! A baunilha é um cheiro seguro que aciona memórias de conforto quase instantâneas. Esse simples ato cria um micro-hábito que corta a vigilância da rotina corporativa, liberando dopamina (motivação, e não apenas prazer) que preserva sua energia mental até o fim do dia."
    },
    {
        id: 8,
        nome: "NIVEA Flor de Laranjeira",
        tagline: "Conforto prático com óleo de Jojoba.",
        dica: "Hidratante pra 'ir pro mundo'. Saiu do banho, passou, absorveu. Não mela e deixa um brilho imediato.",
        fofoca: "Um clássico baratinho que cumpre tudo que promete pra quem não tem tempo a perder.",
        ciencia: "Eficiência total! O óleo de jojoba possui extrema afinidade química com o sebo natural da pele humana. Ele hidrata de forma inteligente, criando fluência cognitiva: você parece incrivelmente cuidada com zero esforço mental. A aparência organizada gera uma resposta inconsciente de preferência nas pessoas ao redor."
    },
    {
        id: 9,
        nome: "Effaclar Gel Concentrado | La Roche-Posay",
        tagline: "A faxina técnica inteligente.",
        dica: "Não é para o dia a dia. É para aquela 'limpeza premium' no banho quente quando a pele pede socorro.",
        fofoca: "Validado por dermato desde a adolescência. É a sensação de pele lavada, controlada e adulta.",
        ciencia: "O estresse altera quimicamente a oleosidade. Esse gel não agride; ele desobstrui poros e reduz inflamações através de ativos controlados. A limpeza física gera um sinal de segurança e previsibilidade pro cérebro, baixando a carga alostática: você entra na sala com a certeza biológica de que não há nada falhando no seu controle."
    },
    {
        id: 10,
        nome: "Pré-treino Capilar | Cris Dios",
        tagline: "Protetor solar invisível do fio.",
        dica: "Passe antes de prender o cabelo para trabalhar ou treinar. Adeus bad hair day.",
        fofoca: "Assuma a mulher-maravilha: protege do suor, elástico e ar condicionado. O cabelo agradece calado.",
        ciencia: "O cérebro busca eficiência energética. Cuidar de cabelo espigado é gasto mental. Esse pré-treino tem cupuaçu e quinoa, criando resistência contra o dano mecânico extremo (fricção e estresse oxidativo). Quando você elimina a fricção, preserva fios e, principalmente, preserva o foco: você não perde minutos preciosos lutando com o espelho."
    },
    {
        id: 11,
        nome: "Studio Finish Concealer SPF 35 | MAC",
        tagline: "Meu corretivo de guerra.",
        dica: "Dura a vida toda. Pressione suavemente com os dedos, não esfregue. Use nos dias em que o sono faltou.",
        fofoca: "Custa caro mas não te abandona no meio do dia. Tira qualquer rastro de cansaço ou olheira pesada.",
        ciencia: "Alta concentração de pigmento numa base de óleos estruturantes, garantindo durabilidade térmica (não derrete!). Ao disfarçar a exaustão física, você aumenta a sua 'fluência cognitiva' visual. A aparência organizada reduz sinais de vulnerabilidade perante os outros, alterando a percepção externa ao seu favor em frações de segundos."
    },
    {
        id: 12,
        nome: "Protetor Solar Bastão | Pink Cheeks",
        tagline: "Escudo do triathlon pra vida real.",
        dica: "Uso a cor 21km como base. Proteção absoluta com toque sequinho e zero de complicação.",
        fofoca: "A proteção é o maior ato de amor anti-idade. Sua pele do futuro aplaude.",
        ciencia: "Fisiologia pura! Formulado com filtros físicos (dióxido de titânio), ele constrói uma barreira intransponível e resistente ao suor. Uma pele protegida diminui drasticamente a inflamação tecidual diária. E imunidade alta significa menos oscilações no seu humor basal e percepção de bem-estar!"
    },
    {
        id: 13,
        nome: "Listerine Melancia e Hortelã",
        tagline: "O melhor sabor, sem discussão.",
        dica: "Bochecho diário para sensação de limpeza absoluta antes de dominar a rua.",
        fofoca: "Aquele frescor de boca de mulher absurdamente higiênica e beijável, sem a ardência infernal.",
        ciencia: "Seus óleos essenciais (timol, mentol, eucaliptol) matam bactérias instantaneamente. Mas o pulo do gato está no sabor agradável: ele diminui o atrito do hábito, reduzindo o custo energético para o cérebro. Uma recompensa imediata gostosa (sabor) garante que o seu cérebro continue engajado no ritual diário de autocuidado."
    },
    {
        id: 14,
        nome: "Dersani Regenerador",
        tagline: "O recuperador cutâneo extremo.",
        dica: "Bunda, braços, joelhos, canela. É o SOS pra super-hidratação que você deixa agir durante a noite.",
        fofoca: "Fez desaparecer queimadura de 3º grau no asfalto (pós-kart). Imagine o que faz com cotovelo seco.",
        ciencia: "Uma bomba biológica! Ricaço em ácidos graxos essenciais (AGEs), e vitaminas A e E, ele entra direto na cadeia celular forçando a reorganização de colágeno e a epiderme. Seu corpo não perde tempo: trata a recuperação como restabelecimento da 'homeostase', enviando estímulos diretos ao sistema imunológico."
    },
    {
        id: 15,
        nome: "Neostrata Oil Control",
        tagline: "O controle absoluto de narrativa.",
        dica: "No banho, antes de reuniões que decidem seu mês. O rosto sai parecendo uma tela lisa perfeita.",
        fofoca: "Aquele produto profissional pra quando 'ok, agora eu me preparei pra performar'.",
        ciencia: "Possui ácido glicólico em dose exata para desobstrução e renovação celular, quebrando células mortas. Pele controlada é biologia traduzida em dominância: a uniformidade estética dá uma sensação inconsciente de previsibilidade e precisão. Você não brilha de suor/oleosidade, você brilha de energia mental e clareza!"
    },
    {
        id: 16,
        nome: "Óleo de Buriti | Pira",
        tagline: "O reset corporal da executiva.",
        dica: "Massageie os próprios pés após um dia intenso. Ele tem um tom laranja vibrante que energiza.",
        fofoca: "Um ritual silencioso para tirar o salto alto e dizer ao corpo: você não é só uma ferramenta produtiva.",
        ciencia: "Altamente carregado de betacaroteno, ele descarrega um caminhão de antioxidantes na pele. O toque direcionado nos pés ativa a liberação de oxitocina e endorfinas pelo sistema nervoso parassimpático, derrubando o cortisol diário num estalar de dedos. É o ritual perfeito de interrupção do caos."
    },
    {
        id: 17,
        nome: "Geleia Esfoliante Romã | L'Occitane",
        tagline: "Meu spa revigorante de sauna.",
        dica: "Fricção delicada no chuveiro ou na sauna. É renovação que limpa o peso corporal da semana.",
        fofoca: "A textura é tão divina que você sai com a pele incrivelmente viva e energia recarregada.",
        ciencia: "O esfoliante atua ativamente na renovação das células mortas enquanto estimula brutalmente a circulação periférica. Essa fricção, associada à temperatura (água morna/sauna), manda um forte sinal sensorial pro sistema límbico: sua pele percebe conforto, seu cérebro cancela a percepção de rejeição/estresse e aumenta o seu relaxamento."
    },
    {
        id: 18,
        nome: "Amber Romance (Bodysplash)",
        tagline: "O foguinho secreto das 15h.",
        dica: "A energia corporativa caiu? Dê uma borrifada no ar em vez de tomar o 4º café.",
        fofoca: "O segredo para se sentir uma mulher perfumada intocável mesmo afogada em planilhas.",
        ciencia: "O olfato reage em frações de segundo. Ao inalar notas quentes, você provoca uma reação endócrina instantânea. Sem que você se esforce, o cérebro recebe o sinal afetivo, desvia do cansaço e recarrega os níveis de dopamina (que é, cientificamente, a molécula de ação e motivação, diminuindo a procrastinação)."
    },
    {
        id: 19,
        nome: "Óleo de Banho Amêndoa | L'Occitane",
        tagline: "Rito premium de transição.",
        dica: "Em contato com a água vira um leite no corpo. Use com uma esponjinha fofa de forma lenta e devagar.",
        fofoca: "Um luxo absurdo que desliga a executiva em chamas e traz de volta a mulher macia e segura.",
        ciencia: "O cérebro adora transições bem demarcadas (o fim do trabalho, o início do repouso). A experiência hiper-sensorial desse óleo (textura que muda e perfume expansivo) interrompe a vigília neurológica intensa. Esse ritual organizado informa o corpo que é o momento de desligar a sobrecarga mental."
    },
    {
        id: 20,
        nome: "Avatim Verbena e Bambu",
        tagline: "O banho saideira pra dormir ou pós-treino.",
        dica: "Passe sem dó e vá dormir ou curtir. O mundo e você mesma vão soltar um: 'oloko que gostosa'.",
        fofoca: "Sensação de estar usando um produto de US$200, mas paguei super pouco. Zero frescura, 100% classe.",
        ciencia: "A biologia do aroma: a Verbena cítrica ativa o foco e cria percepção de ordem; o Bambu é transparente e traz leveza à psique. Essa combinação limpa quimicamente o 'ruído' acumulado pelo seu sistema límbico, gerando estabilidade emocional (homeostase) e uma assinatura inesquecível do seu valor perante os outros."
    }
];

const MOTIVATIONAL_QUOTES = [
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
const FRASES_CIENTIFICAS = [
    "Você sabia que o autocuidado não é estética, é fisiologia? A ciência comprova que rituais repetidos reduzem a incerteza do cérebro, baixando o seu cortisol e diminuindo a ansiedade.",
    "A ciência explica: quando você passa um hidratante, o toque ativa mecanorreceptores que ligam o seu modo 'descansar e recuperar'.",
    "Você sabia que o seu perfume é um atalho biológico? O olfato vai direto para o sistema límbico, desativando o alerta de ameaça do cérebro.",
    "A neurociência comprova que a forma como você se cuida altera sua postura. E uma postura imponente aumenta a autoconfiança via neurotransmissores.",
    "A ciência mostra que a nossa pele é um órgão sensorial ativo. Um banho premium sinaliza para o seu hipotálamo que você está segura, melhorando o seu foco."
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
    const [fraseCientificaInicial, setFraseCientificaInicial] = useState(null);

    useEffect(() => {
        if (!auth) return;
        const initAuth = async () => {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                await signInWithCustomToken(auth, __initial_auth_token);
            } else {
                await signInAnonymously(auth);
            }
        };
        initAuth();
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
        }, (error) => {
            console.error("Erro ao buscar histórico:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const getRecommendation = (val) => {
        setExpandedProductInfo({}); 
        
        if (val === 0) {
            return {
                title: "Ritual de UTI da Autoestima",
                desc: "Zerou a bateria? Tudo bem. Modo sobrevivência e conforto extremo ativado.",
                steps: [PRODUTOS_MANUAL[13], PRODUTOS_MANUAL[5], PRODUTOS_MANUAL[0]],
                color: "text-red-600", bg: "bg-red-50", border: "border-red-100",
                quote: "Não exija performance de um corpo exausto. Hoje é dia de barreira de proteção e colo."
            };
        } else if (val === 1) {
            return {
                title: "Ritual do Aconchego",
                desc: "O mundo foi duro? Vamos criar uma bolha de paz só sua.",
                steps: [PRODUTOS_MANUAL[18], PRODUTOS_MANUAL[3], PRODUTOS_MANUAL[2]],
                color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100",
                quote: "Tratar-se com doçura quando tudo parece amargo é o seu maior ato de rebeldia."
            };
        } else if (val === 2) {
            return {
                title: "Ritual de Resgate Profundo",
                desc: "A energia está voltando devagar. Vamos estimular os sentidos para religar você.",
                steps: [PRODUTOS_MANUAL[16], PRODUTOS_MANUAL[15], PRODUTOS_MANUAL[6]],
                color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100",
                quote: "O toque com intenção muda a química do cérebro. Você está voltando pro seu eixo."
            };
        } else if (val === 3) {
            return {
                title: "Ritual do Despertar Rápido",
                desc: "O brilho tá aí, só deu uma apagadinha. Vamos acordar essa gostosa com praticidade.",
                steps: [PRODUTOS_MANUAL[7], PRODUTOS_MANUAL[12], PRODUTOS_MANUAL[17]],
                color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100",
                quote: "Às vezes tudo que o cérebro precisa é de um estímulo sensorial rápido para recalcular a rota."
            };
        } else if (val === 4) {
            return {
                title: "Ritual de Manutenção do Glow",
                desc: "Você está no caminho! Vamos garantir a sua proteção e foco magnético hoje.",
                steps: [PRODUTOS_MANUAL[8], PRODUTOS_MANUAL[11], PRODUTOS_MANUAL[19]],
                color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-100",
                quote: "O autocuidado altera a postura sem esforço consciente. Vamos treinar esse músculo do brilho!"
            };
        } else {
            return {
                title: "Ritual de Celebração Absoluta",
                desc: "Poder total! Sustenta o brilho executiva bilionária e conquista o mundo.",
                steps: [PRODUTOS_MANUAL[4], PRODUTOS_MANUAL[14], PRODUTOS_MANUAL[1]],
                color: "text-fuchsia-600", bg: "bg-fuchsia-50", border: "border-fuchsia-100",
                quote: "Identidade de valor aumenta limites pessoais. Sua assinatura de poder é o seu próprio respeito."
            };
        }
    };

    const handleMoodSubmit = () => {
        setActiveRitual(getRecommendation(score));
        setView('ritual');
    };

    const toggleScienceInfo = (id) => {
        setExpandedProductInfo(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
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
            try {
                const colRef = collection(db, 'artifacts', appId, 'users', user.uid, 'history');
                await addDoc(colRef, newEntry);
            } catch (err) {
                console.error("Erro ao salvar entrada no banco:", err);
            }
        }

        const nextCount = history.length + 1;
        if (nextCount % 3 === 0) {
            setShowMotivationBtn(true);
            setMotivationQuote(null);
        }

        setView('history');
    };

    const showMotivation = () => {
        const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        setMotivationQuote(randomQuote);
        setShowMotivationBtn(false);
    };

    return (
        <div className="min-h-screen text-slate-900 flex items-center justify-center p-4 bg-gradient-to-br from-[#fff5f7] to-[#ffe4ec] font-['Plus_Jakarta_Sans']">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
                
                .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .score-bar { transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .glossy-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 8px 32px 0 rgba(236, 72, 153, 0.08);
                }
                .science-expand {
                    transition: max-height 0.4s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s;
                    max-height: 0;
                    opacity: 0;
                    overflow: hidden;
                }
                .science-expand.open {
                    max-height: 500px;
                    opacity: 1;
                    padding-top: 1rem;
                }
            `}</style>

            <div className="w-full max-w-md bg-white min-h-[640px] shadow-2xl rounded-[3rem] overflow-hidden border-4 border-pink-100 flex flex-col relative">
                
                <header className="p-6 border-b border-pink-50 flex justify-between items-center bg-white/90 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('mood')}>
                        <div>
                            <h1 className="font-black text-slate-800 leading-none text-lg tracking-tight">
                                TERMÔMETRO DA AUTOESTIMA
                            </h1>
                            <span className="text-[10px] text-pink-500 font-bold uppercase tracking-[0.2em]">
                                O Guia Secreto
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={() => setView(v => v === 'history' ? 'mood' : 'history')}
                        className="p-3 hover:bg-pink-50 rounded-full transition-all text-pink-400"
                        type="button"
                    >
                        <History className="w-6 h-6" />
                    </button>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    
                    {view === 'mood' && (
                        <div className="space-y-8 animate-slide-up text-center">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-fuchsia-50 text-fuchsia-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    <Sparkles className="w-3 h-3" /> Fofoca Científica
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 leading-tight px-2">
                                    Como está o seu brilho interior hoje?
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">
                                    De 0 a 5, quanto você está do seu próprio lado?
                                </p>
                            </div>

                            <div className="flex justify-between items-end gap-2 px-2 h-40">
                                {[0, 1, 2, 3, 4, 5].map((val) => (
                                    <button 
                                        key={val}
                                        onClick={() => setScore(val)}
                                        type="button"
                                        className="flex-1 flex flex-col items-center group"
                                    >
                                        <div 
                                            className={cn(
                                                "w-full rounded-2xl transition-all duration-500 score-bar",
                                                score === val ? "bg-gradient-to-t from-pink-600 to-fuchsia-400 shadow-xl shadow-pink-200" : "bg-pink-50 opacity-40 group-hover:opacity-60"
                                            )}
                                            style={{ height: `${val * 18 + 30}px` }}
                                        />
                                        <span className={cn(
                                            "mt-3 text-xs font-black transition-colors",
                                            score === val ? "text-pink-600" : "text-slate-300"
                                        )}>
                                            {val}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-center gap-12 pt-4">
                                <Frown className={cn("w-10 h-10 transition-all duration-500", score <= 2 ? "text-rose-500 scale-125 drop-shadow-lg" : "text-slate-200")} />
                                <Meh className={cn("w-10 h-10 transition-all duration-500", score === 3 ? "text-pink-400 scale-125 drop-shadow-lg" : "text-slate-200")} />
                                <Smile className={cn("w-10 h-10 transition-all duration-500", score >= 4 ? "text-fuchsia-500 scale-125 drop-shadow-lg" : "text-slate-200")} />
                            </div>

                            {fraseCientificaInicial && (
                                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm italic font-medium leading-relaxed text-left shadow-sm">
                                    "{fraseCientificaInicial}"
                                </div>
                            )}

                            <button 
                                onClick={() => setFraseCientificaInicial(FRASES_CIENTIFICAS[Math.floor(Math.random() * FRASES_CIENTIFICAS.length)])} 
                                type="button"
                                className="w-full bg-transparent border-2 border-slate-900 text-slate-900 font-bold py-4 rounded-[2rem] transition-colors hover:bg-slate-50"
                            >
                                Me Motive
                            </button>

                            <button 
                                onClick={handleMoodSubmit}
                                type="button"
                                className="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 text-lg hover:bg-pink-600"
                            >
                                Ver Meu Ritual
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {view === 'ritual' && activeRitual && (
                        <div className="space-y-6 animate-slide-up">
                            <div className={cn(
                                "p-8 rounded-[2.5rem] border-2 shadow-inner space-y-4 text-center relative overflow-hidden",
                                activeRitual.bg, activeRitual.border
                            )}>
                                <Quote className="absolute -top-2 -left-2 w-16 h-16 text-pink-200 opacity-30" />
                                <h2 className={cn("font-black text-2xl tracking-tight", activeRitual.color)}>
                                    {activeRitual.title}
                                </h2>
                                <p className="text-slate-700 text-sm font-bold italic leading-relaxed">
                                    "{activeRitual.quote}"
                                </p>
                            </div>

                            <div className="space-y-5">
                                <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] ml-2">
                                    Passos do Manual:
                                </h3>
                                {activeRitual.steps.map((item, idx) => {
                                    const isExpanded = expandedProductInfo[item.id];

                                    return (
                                        <div key={idx} className="glossy-card p-6 rounded-[2rem] border border-white space-y-3 relative">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                                                        {item.tagline}
                                                    </span>
                                                    <h4 className="font-black text-slate-900 text-lg leading-tight pr-4">
                                                        {item.nome}
                                                    </h4>
                                                </div>
                                                <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                                                    {idx + 1}
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                                                {item.dica}
                                            </p>
                                            
                                            <div className="pt-2 flex gap-2">
                                                <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
                                                <p className="text-[11px] text-fuchsia-500 font-bold italic">
                                                    "{item.fofoca}"
                                                </p>
                                            </div>

                                            <div className="pt-4 border-t border-pink-50/50">
                                                <button 
                                                    onClick={() => toggleScienceInfo(item.id)}
                                                    className="w-full flex items-center justify-between py-2 text-indigo-500 hover:text-indigo-600 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FlaskConical className="w-4 h-4" />
                                                        <span className="text-[11px] font-bold uppercase tracking-widest">
                                                            Por que esse produto é tão bom?
                                                        </span>
                                                    </div>
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />}
                                                </button>

                                                <div className={cn("science-expand", isExpanded && "open")}>
                                                    <div className="bg-indigo-50/60 rounded-2xl p-4 border border-indigo-100/50">
                                                        <p className="text-[13px] leading-relaxed text-indigo-900/80 font-medium">
                                                            <strong className="text-indigo-600">A Fisiologia:</strong> {item.ciencia}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                onClick={confirmCheckIn}
                                type="button"
                                className="w-full bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3 group mt-4"
                            >
                                <span className="text-lg">Tô Gostosa!</span>
                                <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    )}

                    {view === 'history' && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="text-center">
                                <h2 className="text-2xl font-black text-slate-900">Evolução do Glow</h2>
                                <p className="text-xs text-pink-400 font-bold uppercase tracking-widest">Sua jornada de autoestima</p>
                            </div>

                            {showMotivationBtn && (
                                <div className="animate-slide-up">
                                    <button 
                                        onClick={showMotivation}
                                        className="w-full bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        FRASE POEMA
                                        <Sparkles className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {motivationQuote && (
                                <div className="animate-slide-up bg-gradient-to-br from-fuchsia-100 to-pink-100 p-6 rounded-[2rem] border-2 border-white shadow-inner relative overflow-hidden text-center">
                                    <Quote className="absolute -top-2 -left-2 w-12 h-12 text-pink-200 opacity-40" />
                                    <p className="text-fuchsia-700 font-bold italic text-lg leading-relaxed relative z-10">
                                        "{motivationQuote}"
                                    </p>
                                </div>
                            )}
                            
                            <div className="h-60 w-full bg-pink-50/20 rounded-[2.5rem] p-6 border border-pink-50">
                                {history.length >= 2 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={history.slice().reverse()}>
                                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#ffe4ec" />
                                            <XAxis 
                                                dataKey="date" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: '#ec4899', fontSize: 10, fontWeight: '800' }} 
                                            />
                                            <YAxis domain={[0, 5]} hide={true} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 30px rgba(236, 72, 153, 0.2)', padding: '15px' }}
                                                itemStyle={{ color: '#db2777', fontWeight: '900' }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="score" 
                                                stroke="#ec4899" 
                                                strokeWidth={6} 
                                                dot={{ r: 7, fill: '#ec4899', strokeWidth: 4, stroke: '#fff' }} 
                                                activeDot={{ r: 9, strokeWidth: 0 }} 
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-pink-300 text-sm gap-4 text-center">
                                        <Heart className="w-12 h-12 opacity-20 animate-pulse" />
                                        <span className="font-black leading-tight">
                                            Quase lá! Tens {history.length} check-in. <br/>Mais um para desbloquear o gráfico!
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                {history.map((entry, i) => (
                                    <div key={entry.timestamp || i} className="flex items-center justify-between p-5 bg-white border-2 border-pink-50 rounded-[1.8rem] hover:border-pink-200 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-black text-slate-400">{entry.date}</span>
                                            <span className="text-[10px] text-pink-300 font-bold">{entry.time || ""}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-pink-600 font-black mr-2 text-sm">Nota {entry.score}</span>
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Heart 
                                                    key={s} 
                                                    className={cn("w-3.5 h-3.5", s <= entry.score ? "text-pink-500 fill-pink-500" : "text-pink-50")} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                <footer className="p-6 bg-slate-900 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-fuchsia-400 fill-fuchsia-400" />
                        <span className="text-[10px] text-white uppercase font-black tracking-[0.4em]">
                            Termômetro da Autoestima
                        </span>
                    </div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest text-center">
                        Feito para quem não tem paciência mas tem autoestima
                    </p>
                </footer>
            </div>
        </div>
    );
}
