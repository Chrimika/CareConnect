export const Specialites = [
  {
    id: 1,
    nom: "Cardiologie",
    sousTitre: "Prenez soin de votre cœur et de votre système cardiovasculaire.",
    details: "La cardiologie traite les troubles du cœur et des vaisseaux sanguins. Elle inclut le diagnostic, le traitement et la prévention des maladies cardiaques.",
    prixConsultation: 15000,
    services: [
      { nom: "Électrocardiogramme (ECG)", prix: 5000, details: "Enregistrement de l'activité électrique du cœur." },
      { nom: "Échographie cardiaque", prix: 20000, details: "Examen d'imagerie pour évaluer les structures du cœur." },
      { nom: "Bilan de prévention cardiaque", prix: 25000, details: "Contrôle complet pour prévenir les maladies cardiaques." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2Fcardiology.png?alt=media&token=32fe6921-1ccf-4abf-8858-77c572bb823c",
    couleur: "#FFB6C1"
  },
  {
    id: 2,
    nom: "Dermatologie",
    sousTitre: "Prenez soin de votre peau, cheveux et ongles.",
    details: "La dermatologie traite les affections cutanées, les maladies des cheveux et des ongles, ainsi que les problèmes esthétiques de la peau.",
    prixConsultation: 10000,
    services: [
      { nom: "Traitement de l'acné", prix: 8000, details: "Soins pour réduire les boutons et cicatrices d'acné." },
      { nom: "Peeling chimique", prix: 15000, details: "Procédure esthétique pour améliorer la texture de la peau." },
      { nom: "Consultation anti-âge", prix: 12000, details: "Conseils et soins pour prévenir le vieillissement cutané." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2Fdematology.png?alt=media&token=3854ee3a-e2d3-4a0b-957a-c999cdf4822b",
    couleur: "#FFDAB9"
  },
  {
    id: 3,
    nom: "Pédiatrie",
    sousTitre: "La santé et le bien-être de vos enfants avant tout.",
    details: "La pédiatrie prend en charge la santé des nourrissons, des enfants et des adolescents, y compris la prévention et le traitement des maladies infantiles.",
    prixConsultation: 12000,
    services: [
      { nom: "Suivi de croissance", prix: 7000, details: "Contrôle du poids, taille et développement de l'enfant." },
      { nom: "Vaccination", prix: 5000, details: "Administration de vaccins pour protéger contre les maladies." },
      { nom: "Conseil nutritionnel", prix: 8000, details: "Guides pour une alimentation saine adaptée aux enfants." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2Fpediadrie.png?alt=media&token=f3858f31-0b75-45ba-b7b8-1fe4e5ca6415",
    couleur: "#87CEEB"
  },
  {
    id: 4,
    nom: "Neurologie",
    sousTitre: "Votre cerveau et système nerveux entre de bonnes mains.",
    details: "La neurologie traite les troubles du système nerveux central et périphérique, y compris les migraines, l'épilepsie et les troubles neuromusculaires.",
    prixConsultation: 20000,
    services: [
      { nom: "Électroencéphalogramme (EEG)", prix: 10000, details: "Examen pour enregistrer l'activité cérébrale." },
      { nom: "Évaluation des troubles du sommeil", prix: 15000, details: "Diagnostic des insomnies et troubles liés au sommeil." },
      { nom: "Conseil pour la gestion du stress", prix: 10000, details: "Techniques pour réduire les impacts du stress sur le cerveau." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2Fnerology.png?alt=media&token=36caa726-1966-4b4c-a4b8-2e70dd458700",
    couleur: "#DDA0DD"
  },
  {
    id: 5,
    nom: "Ophtalmologie",
    sousTitre: "Prenez soin de votre vision et de vos yeux.",
    details: "L'ophtalmologie prend en charge les troubles de la vision, les maladies des yeux et propose des corrections optiques.",
    prixConsultation: 10000,
    services: [
      { nom: "Examen de la vue", prix: 7000, details: "Contrôle pour évaluer la vision et détecter des anomalies." },
      { nom: "Prescription de lunettes", prix: 5000, details: "Aide à choisir et adapter vos verres correcteurs." },
      { nom: "Conseils pour la santé des yeux", prix: 5000, details: "Prévention des maladies oculaires liées à l'âge." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2Fophtalmology.png?alt=media&token=19dd9c5a-d4a3-414c-977f-2eefcbb20209",
    couleur: "#FFE4B5"
  },
  {
    id: 6,
    nom: "Gynécologie",
    sousTitre: "La santé féminine, un accompagnement personnalisé.",
    details: "La gynécologie traite les troubles du système reproducteur féminin, incluant le suivi de grossesse et les soins préventifs.",
    prixConsultation: 15000,
    services: [
      { nom: "Suivi de grossesse", prix: 20000, details: "Accompagnement médical tout au long de la grossesse." },
      { nom: "Dépistage du cancer du col", prix: 10000, details: "Examen pour détecter précocement les anomalies." },
      { nom: "Conseils en contraception", prix: 8000, details: "Aide pour choisir la méthode contraceptive adaptée." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2FGynecologie.png?alt=media&token=2c29ec9c-15f6-4167-bf71-9d2887d6375a",
    couleur: "#FF69B4"
  },
  {
    id: 7,
    nom: "Orthopédie",
    sousTitre: "Prenez soin de vos os et articulations.",
    details: "L'orthopédie prend en charge les maladies des os, des articulations, et les blessures musculo-squelettiques.",
    prixConsultation: 18000,
    services: [
      { nom: "Bilan postural", prix: 10000, details: "Analyse de la posture et conseils pour prévenir les douleurs." },
      { nom: "Rééducation physique", prix: 20000, details: "Programmes pour améliorer la mobilité après une blessure." },
      { nom: "Conseils pour prévenir l'arthrose", prix: 12000, details: "Techniques pour maintenir la santé articulaire." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2Forthopedie.png?alt=media&token=6f3845e7-2f3e-433b-849e-896c4a3b452a",
    couleur: "#98FB98"
  },
  {
    id: 8,
    nom: "Psychiatrie",
    sousTitre: "Soutien pour votre santé mentale et émotionnelle.",
    details: "La psychiatrie traite les troubles mentaux tels que la dépression, l'anxiété et les troubles de l'humeur.",
    prixConsultation: 20000,
    services: [
      { nom: "Thérapie cognitive", prix: 15000, details: "Séances pour traiter les pensées et comportements négatifs." },
      { nom: "Gestion de l'anxiété", prix: 12000, details: "Techniques pour réduire les troubles anxieux." },
      { nom: "Groupes de soutien", prix: 10000, details: "Rencontres pour partager et échanger avec d'autres." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2Fpsychiatrie.png?alt=media&token=2e74ef5d-d24d-4c73-8477-eed37845f172",
    couleur: "#B0C4DE"
  },
  {
    id: 9,
    nom: "Gastro-entérologie",
    sousTitre: "Prenez soin de votre système digestif.",
    details: "La gastro-entérologie traite les maladies de l'appareil digestif, y compris l'estomac, les intestins, le foie, et le pancréas.",
    prixConsultation: 18000,
    services: [
        { nom: "Endoscopie", prix: 25000, details: "Examen des voies digestives avec une caméra." },
        { nom: "Traitement des ulcères", prix: 20000, details: "Soins pour soulager les douleurs et guérir les ulcères." },
        { nom: "Dépistage des maladies hépatiques", prix: 22000, details: "Analyse pour détecter les troubles du foie." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2FGastro-enterologie.png?alt=media&token=57f7ec72-e99b-4763-a78a-d1a5a5ba692f",
    couleur: "#FFD700"
  },
  {
    id: 10,
    nom: "Endocrinologie",
    sousTitre: "Prenez soin de vos hormones et votre métabolisme.",
    details: "L'endocrinologie traite les troubles hormonaux et les maladies du métabolisme, comme le diabète et les troubles thyroïdiens.",
    prixConsultation: 20000,
    services: [
        { nom: "Évaluation thyroïdienne", prix: 15000, details: "Analyse et diagnostic des troubles thyroïdiens." },
        { nom: "Gestion du diabète", prix: 20000, details: "Consultation pour équilibrer la glycémie." },
        { nom: "Bilan hormonal complet", prix: 25000, details: "Examen pour détecter les déséquilibres hormonaux." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2FEndocrinologie.png?alt=media&token=316e5c1c-012a-4f16-b764-329e00a498c8",
    couleur: "#FF8C00"
  },
  {
    id: 11,
    nom: "Oto-rhino-laryngologie (ORL)",
    sousTitre: "Soins pour vos oreilles, nez et gorge.",
    details: "L'ORL traite les troubles des oreilles, du nez, de la gorge ainsi que les problèmes d'équilibre et de voix.",
    prixConsultation: 15000,
    services: [
        { nom: "Examen auditif", prix: 10000, details: "Contrôle de la capacité auditive." },
        { nom: "Traitement des allergies nasales", prix: 12000, details: "Soins pour les problèmes liés aux allergies." },
        { nom: "Consultation pour apnée du sommeil", prix: 20000, details: "Évaluation et traitement des troubles respiratoires." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2FORL_(Oto-Rhino-Laryngologie).png?alt=media&token=c86faea1-9203-427b-9450-0c0ea521799d",
    couleur: "#32CD32"
  },
  {
    id: 12,
    nom: "Rhumatologie",
    sousTitre: "Prenez soin de vos articulations et muscles.",
    details: "La rhumatologie traite les maladies des os, des articulations, et des muscles, comme l'arthrite et l'ostéoporose.",
    prixConsultation: 20000,
    services: [
        { nom: "Évaluation des douleurs articulaires", prix: 15000, details: "Diagnostic des troubles articulaires." },
        { nom: "Traitement de l'ostéoporose", prix: 25000, details: "Soins pour renforcer les os fragiles." },
        { nom: "Programme de réhabilitation physique", prix: 30000, details: "Plan pour restaurer la mobilité et la force." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2FRhumatologie.png?alt=media&token=8a8c39df-3617-4cd9-8fa6-5ac253bc3f3f",
    couleur: "#6A5ACD"
  },
  {
    id: 13,
    nom: "Oncologie",
    sousTitre: "Accompagnement et soins dans la lutte contre le cancer.",
    details: "L'oncologie prend en charge le diagnostic, le traitement, et le suivi des cancers.",
    prixConsultation: 30000,
    services: [
        { nom: "Consultation spécialisée en cancérologie", prix: 25000, details: "Diagnostic et plan de traitement personnalisé." },
        { nom: "Chimiothérapie", prix: 80000, details: "Traitement médicamenteux pour éliminer les cellules cancéreuses." },
        { nom: "Accompagnement en soins palliatifs", prix: 20000, details: "Soutien pour améliorer la qualité de vie." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2FOncologie.png?alt=media&token=8de172ec-ef96-4d67-ae76-afa46ecbad74",
    couleur: "#FF6347"
  },
  {
    id: 14,
    nom: "Urologie",
    sousTitre: "Soins pour votre système urinaire et reproducteur.",
    details: "L'urologie traite les maladies de l'appareil urinaire et du système reproducteur masculin.",
    prixConsultation: 18000,
    services: [
        { nom: "Examen prostatique", prix: 20000, details: "Évaluation pour détecter les troubles de la prostate." },
        { nom: "Traitement des infections urinaires", prix: 15000, details: "Soins pour soulager les douleurs urinaires." },
        { nom: "Analyse des calculs rénaux", prix: 25000, details: "Diagnostic et options de traitement pour les pierres rénales." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2FUrologie.png?alt=media&token=3b29d003-90d8-4841-9699-7daeccf4a458",
    couleur: "#4682B4"
  },
  {
    id: 15,
    nom: "Chirurgie générale",
    sousTitre: "Interventions pour soigner et réparer.",
    details: "La chirurgie générale prend en charge les opérations des organes internes, des tissus mous et des zones externes.",
    prixConsultation: 25000,
    services: [
        { nom: "Consultation préopératoire", prix: 15000, details: "Évaluation et préparation avant une intervention." },
        { nom: "Chirurgie digestive", prix: 80000, details: "Opérations pour traiter les troubles digestifs graves." },
        { nom: "Chirurgie d'urgence", prix: 100000, details: "Interventions rapides pour des cas critiques." }
    ],
    imageRepresentatif: "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2FChirurgie-Generale.png?alt=media&token=15f8c24c-6ac5-4df2-901c-29bccbceb20f",
    couleur: "#DAA520"
  },
  {
    "id": 16,
    "nom": "Dentiste",
    "sousTitre": "Un sourire en pleine santé.",
    "details": "Les dentistes prennent soin de votre santé bucco-dentaire en prévenant, diagnostiquant et traitant les maladies des dents et des gencives.",
    "prixConsultation": 15000,
    "services": [
      {
        "nom": "Consultation générale",
        "prix": 15000,
        "details": "Examen complet de la bouche, des dents et des gencives."
      },
      {
        "nom": "Détartrage",
        "prix": 20000,
        "details": "Nettoyage des dents pour éliminer le tartre et prévenir les caries."
      },
      {
        "nom": "Blanchiment dentaire",
        "prix": 40000,
        "details": "Traitement esthétique pour éclaircir et embellir le sourire."
      },
      {
        "nom": "Extraction dentaire",
        "prix": 25000,
        "details": "Retrait des dents endommagées ou mal positionnées."
      },
      {
        "nom": "Traitement des caries",
        "prix": 20000,
        "details": "Réparation des dents endommagées avec des obturations de qualité."
      }
    ],
    "imageRepresentatif": "https://firebasestorage.googleapis.com/v0/b/papersbook-f3826.appspot.com/o/specialistsIcons%2Fdentist.png?alt=media&token=3fa6c207-0788-4ef7-afa0-3bd8c8c5fe03",
    "couleur": "#B0E0E6"
  }
];
