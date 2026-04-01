# GesCommande — Gestion de commandes pour PME & Freelances

Application web de gestion de commandes avec tableau de bord, suivi des revenus et génération de factures téléchargeables.

## Architecture du projet

```
gescommande/
├── src/
│   ├── components/
│   │   ├── Dashboard/           # Vue tableau de bord
│   │   │   ├── Dashboard.jsx       Orchestrateur de la page dashboard
│   │   │   ├── StatCard.jsx        Carte KPI réutilisable
│   │   │   ├── MiniBarChart.jsx    Graphique des revenus mensuels
│   │   │   ├── RecentOrders.jsx    Liste des commandes récentes
│   │   │   ├── StatusBreakdown.jsx Répartition par statut
│   │   │   └── index.js
│   │   ├── Orders/              # Vue commandes
│   │   │   ├── OrdersTable.jsx     Table + barre de filtre/recherche
│   │   │   ├── OrderRow.jsx        Ligne individuelle de commande
│   │   │   ├── NewOrderForm.jsx    Formulaire de création
│   │   │   └── index.js
│   │   ├── Invoice/             # Génération de factures
│   │   │   ├── generateInvoice.js  Ouvre une facture imprimable
│   │   │   └── index.js
│   │   ├── Layout/              # Structure / navigation
│   │   │   ├── Sidebar.jsx         Navigation latérale
│   │   │   ├── PageHeader.jsx      En-tête de page + CTA
│   │   │   └── index.js
│   │   └── UI/                  # Composants réutilisables
│   │       ├── Modal.jsx           Modale générique
│   │       ├── InputField.jsx      Champ de formulaire
│   │       ├── Badge.jsx           Badge de statut
│   │       └── index.js
│   ├── constants/
│   │   ├── theme.js             # Couleurs, espacements, typographie
│   │   └── status.js            # Configuration des statuts + mois FR
│   ├── utils/
│   │   ├── format.js            # Formatage monétaire et dates
│   │   ├── orders.js            # Calculs et helpers commande
│   │   └── stats.js             # Agrégations pour le dashboard
│   ├── hooks/
│   │   └── useOrders.js         # Hook central : CRUD, filtrage, tri
│   ├── data/
│   │   └── initialOrders.js     # Données de démonstration
│   └── App.jsx                  # Point d'entrée — compose les vues
└── README.md
```

## Principes d'architecture

| Couche        | Responsabilité |
|---------------|----------------|
| `constants/`  | Tokens de design, config. Zéro logique. |
| `utils/`      | Fonctions pures, testables unitairement. |
| `hooks/`      | État global + actions métier. |
| `data/`       | Données seed / mocks. |
| `components/` | UI découpée par domaine fonctionnel. |

### Flux de données

```
App.jsx (routage des vues)
  └─ useOrders()  ← hook central (state + actions)
       ├─ Dashboard  ← lectures via computeStats / computeMonthlyRevenue
       ├─ OrdersTable ← données filtrées + callbacks
       └─ NewOrderForm ← addOrder callback
```

## Fonctionnalités

- **Tableau de bord** : 4 KPI, graphique mensuel, commandes récentes, breakdown par statut
- **Gestion commandes** : recherche, filtres, changement de statut en ligne
- **Facture PDF** : génération HTML dans un nouvel onglet, impression native du navigateur
- **Nouvelle commande** : multi-articles, calcul en temps réel

## Pour aller plus loin

- Brancher sur un backend (Supabase, Firebase, API REST)
- Ajouter `react-router` pour la navigation
- Persister les données avec `localStorage` ou une base de données
- Ajouter l'export CSV des commandes
- Intégrer un vrai moteur PDF (jsPDF, @react-pdf/renderer)
