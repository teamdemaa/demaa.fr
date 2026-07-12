import { RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG } from "@/lib/content-relationships";
import type { System } from "@/lib/types";
import rawEnterpriseAnnuaire from "@/lib/enterprise-annuaire.json";

type EnterpriseSummary = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  icon: string;
  price: string;
};

const enterpriseCatalog = (rawEnterpriseAnnuaire as { enterprises: EnterpriseSummary[] }).enterprises;
const enterpriseCatalogBySlug = Object.fromEntries(
  enterpriseCatalog.map((enterprise) => [enterprise.slug, enterprise]),
);

function enterpriseToSystem(enterprise: EnterpriseSummary): System {
  return {
    id: enterprise.id,
    slug: enterprise.slug,
    name: enterprise.name,
    category: enterprise.category,
    description: enterprise.description,
    tags: enterprise.tags,
    icon: enterprise.icon,
    price: enterprise.price,
  };
}

export type DocumentModel = {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  seoDescription?: string;
  content: string;
  category: string;
  date: string;
  image?: string;
  slides?: string[];
  ctaLabel: string;
  ctaHref: string;
  tags: string[];
  systemSlug?: string;
  relatedSystemSlugs?: string[];
  featuredRank?: number;
};

function getGoogleDriveFileId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  return match?.[1] ?? null;
}

export function getDocumentModelPreviewSrc(model: DocumentModel): string | null {
  const slidePreview = model.slides?.[0] ?? model.image;

  if (slidePreview) {
    return slidePreview;
  }

  const fileId = getGoogleDriveFileId(model.ctaHref);

  if (!fileId) {
    return null;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

export const PILOTING_SHEET_URLS: Partial<Record<string, string>> = {
  batiment: "https://docs.google.com/spreadsheets/d/1hThXGp-YMvO69dQIyAbFNMQVByzE973tbrnjIUMkYMs/edit",
  "plomberie-chauffage":
    "https://docs.google.com/spreadsheets/d/1cruI9aFuuP4ggbbQ2nQKxA2Pcv1dJGL9K3SZ-gJGKGQ/edit",
  "electricite-generale":
    "https://docs.google.com/spreadsheets/d/1cGtxwRceldfZlFjokVTfkuOJyXrKw0zZ8E87Ue7F7FE/edit",
  "renovation-interieur":
    "https://docs.google.com/spreadsheets/d/1Mj_cU-we__AkIv3VetPPLCdE88bhPsgzPW9863y9ZzM/edit",
  "menuiserie-agencement":
    "https://docs.google.com/spreadsheets/d/1Cv_zaCfuDH8APYRgbVoWQajSZwcjWknhvMxUN1HWSNY/edit",
  "maconnerie-gros-oeuvre":
    "https://docs.google.com/spreadsheets/d/1g8znKrrHg28-aOS2yBce_VNpE4g5_jdgbAi7hvB-vic/edit",
  "architecte-maitre-oeuvre":
    "https://docs.google.com/spreadsheets/d/11MyBHnQIB_7ClHQOZakw20fKE8bY_SevzmJw7HUVrO4/edit",
  "peintre-en-batiment":
    "https://docs.google.com/spreadsheets/d/1WL5ZBbGQWTSEdjaHIz7C70EPzuTM5VN2RSLmqbbddxI/edit",
  couvreur: "https://docs.google.com/spreadsheets/d/1TxpREzqwewHhFFB4zUeLfGJRgMBqJi5J8pNj-aBF1RY/edit",
  carreleur: "https://docs.google.com/spreadsheets/d/1rslN-Iquxm6Cp3D8SBz_ZXoCRCylhiUlFMYhP_oz6uk/edit",
  climatisation:
    "https://docs.google.com/spreadsheets/d/1Acdluq7dc-H_34fkWd4vJXxYuJXPXUzdD464eICiTcQ/edit",
  paysagiste: "https://docs.google.com/spreadsheets/d/1XQfyE_Fk4PpR24Gyf4Fsv_PSHrtLwPWjHHu0GEI6hno/edit",
  pisciniste: "https://docs.google.com/spreadsheets/d/1hHscXb9BBiCsfkpcxuQ5k2EzHb3Z3s52a-TuTOlHFzM/edit",
  serrurier: "https://docs.google.com/spreadsheets/d/1sznkKMKpSdzNr4scE1usEIgpNyGH0ibXlAyqEh_ilcg/edit",
  "garage-automobile":
    "https://docs.google.com/spreadsheets/d/1-O-rNsfSwNcCtU1Zaab0kWkcTsNBUDzMT0YpG3PZka0/edit",
  carrosserie:
    "https://docs.google.com/spreadsheets/d/1yzTeRFlzWNSMQ1xvsbqCQx0rRqVuUULaoa1Jly4ucfA/edit",
  demenagement:
    "https://docs.google.com/spreadsheets/d/10iF9BBFFOUjV8-W9atnptqjo4ssIjGuyTWCr2YfnCMA/edit",
  "livraison-dernier-kilometre":
    "https://docs.google.com/spreadsheets/d/1vcZsHocv0svXHqbT1r5Jn768DAp4KqgQ1bsh1Lwyieo/edit",
  "transport-de-marchandise":
    "https://docs.google.com/spreadsheets/d/19oKO19pRSZwua2UeGvVzyZnHlOwqCtgS8kBI6CU89Pc/edit",
  "transport-de-personnes":
    "https://docs.google.com/spreadsheets/d/1oyp7LcTYBhd_YnSG6hRkogFXuByQV3SNL8oRVOY5h3E/edit",
  "nettoyage-professionnel":
    "https://docs.google.com/spreadsheets/d/1GyxXzsewMbpSQTVie0w53MLLY1U5ph9f0uZV6LNMfzg/edit",
  "entreprise-de-securite":
    "https://docs.google.com/spreadsheets/d/1wxpRpc4MdgauiTF5MgwJjokgfdHr2OiG9yhBzZJ2Bic/edit",
  "services-a-la-personne":
    "https://docs.google.com/spreadsheets/d/1s4fhzbwG4avCkwWm1jSyC2cGjSrBAzAajGvuS8Ze5fE/edit",
  "aide-a-domicile-menage":
    "https://docs.google.com/spreadsheets/d/1_089awA6PYuNg6_1TOCXeugHTbnGl2jYxW0wXFNS5qs/edit",
  pressing:
    "https://docs.google.com/spreadsheets/d/1fzn8qDag7cTqr7PxeFTHW5tRdTnMb_M5UPIhFMU6trc/edit",
  librairie:
    "https://docs.google.com/spreadsheets/d/1i0NDKw6NedG7zQyBv1UKX8UVoo0QKNkU6sEyPA_iRqk/edit",
  "laverie-automatique":
    "https://docs.google.com/spreadsheets/d/18rjmkDUbiU56tQUPeG79SycFCRKZmMVZnmgmqgVC8KY/edit",
  "agence-de-voyage":
    "https://docs.google.com/spreadsheets/d/135A-PoG2b-AkRuPkzlJeGMuiZLeWThW5h-NUPVPKMTE/edit",
  "agence-marketing":
    "https://docs.google.com/spreadsheets/d/1yqWnO8QnI6MJcjcXQNbsVnptJ8hSEKT56hZcu651RJc/edit",
  "agence-de-recrutement":
    "https://docs.google.com/spreadsheets/d/19NSmKSObnN8Qxhqiv_RQ0b2nKWdKj40hFz1F1f9NSNY/edit",
  "agence-acquisition-paid-ads":
    "https://docs.google.com/spreadsheets/d/1tWbqKgcrnB_J8A06PeEbg6th6f56_p-uc8lOgnk5LHc/edit",
  "agence-seo":
    "https://docs.google.com/spreadsheets/d/1i88Az0ktbbFLPJ5WZQw2cHUwXX4cp_saMkhMl40tCa0/edit",
  "agence-web":
    "https://docs.google.com/spreadsheets/d/1Omv_CKGGgu5F5PRgeNxyQhdRvguOdHyM8tO8vyrxI8w/edit",
  "agence-immobiliere":
    "https://docs.google.com/spreadsheets/d/12sr80ns8ErZEJLyg2N-MKv_aMcWD0_lv6FQMxpcaG0s/edit",
  "cabinet-assurance":
    "https://docs.google.com/spreadsheets/d/1G_ARDtLbJ9SRlFYudXjs_8xCFCqAqn__F0B1koC0p5g/edit",
  "cabinet-comptable":
    "https://docs.google.com/spreadsheets/d/1iZuJ1hSCNksaJC_gTOCdKKg-60MoJj12iZVaqKrgg6c/edit",
  "cabinet-davocat":
    "https://docs.google.com/spreadsheets/d/1LwnvOas8DUG286sZ3jOS-_fBr6Bj1Q8I6ZpE_lYigJw/edit",
  "cabinet-de-conseil":
    "https://docs.google.com/spreadsheets/d/1dULvdh9xRouDhPswybmSSx0c_lSsvENxjT3_8fM3sKM/edit",
  "cabinet-etudes":
    "https://docs.google.com/spreadsheets/d/1KduSKkYqxuSNQ-kbg7-aJzmlvOC4lpaoCbjABuzDqwM/edit",
  "cabinet-rh-externalise":
    "https://docs.google.com/spreadsheets/d/1BgjJeSV4UvuX1S70qJkN0k0lx4veOCAS1kcKu8j5u44/edit",
  "cabinet-qhse-conformite":
    "https://docs.google.com/spreadsheets/d/1hzZG0zRseYmaLxWi1zlkyvWwcO3mHvpXxUBljmpLP6A/edit",
  "bureau-etudes":
    "https://docs.google.com/spreadsheets/d/1zPkMx1zP-zlJ9JOydiPmuhh0UKeJeP3wwhwcqKXDGjI/edit",
  "centre-appels-support-client":
    "https://docs.google.com/spreadsheets/d/1UFj5h5n6EPsbH82I48eXO82wiL91j0KCpR0YSXUfT7g/edit",
  "centre-affaires-coworking":
    "https://docs.google.com/spreadsheets/d/1J0aUXnRoS6xv4-fB_hy1WRdOwMr51jZ_VUtfW5PqE6k/edit",
  "conciergerie-airbnb":
    "https://docs.google.com/spreadsheets/d/1dUVPKmHIPJ84kegJcAGo5mNXe7VS3DzTDFquXClK9j4/edit",
  "consultant-data-bi":
    "https://docs.google.com/spreadsheets/d/1_cYmT--CD78uqmzR44ikO6IQtiqt-1Go6tTx67MnXhs/edit",
  "creation-de-contenu":
    "https://docs.google.com/spreadsheets/d/1dEh8EYDF-6g9locyx_cr0ymyN4CKf9EMFdQ_qlhjR-g/edit",
  "courtier-credit-assurance":
    "https://docs.google.com/spreadsheets/d/1-R2zsH5AM3hBzAyPK_tpTx9f4lp3R9dgGdDdoYLhk-w/edit",
  "chasseur-immobilier":
    "https://docs.google.com/spreadsheets/d/11BCqTUOvy9mMWmrpNfW8nVqjsdvU_NTkMRw5za1vKeA/edit",
  "daf-externalise":
    "https://docs.google.com/spreadsheets/d/1q43O4HiuvNEDkg14ymOu7V_36Q-_0mDgJ9Q8DuBrSbk/edit",
  freelance:
    "https://docs.google.com/spreadsheets/d/1k2CNX0UAPQUuET8Bt2qr717d-Qu9BseSjbln9GwtpRo/edit",
  "gestion-locative":
    "https://docs.google.com/spreadsheets/d/1f_USNIdVd2HDbc9IX0URqcB28WAitK09iGybZ79YrE8/edit",
  "infogerance-informatique":
    "https://docs.google.com/spreadsheets/d/1sg55lZzB5e3pmECzBJb8v6OZta3lW3GWU_B01PgypbU/edit",
  "integrateur-crm-erp":
    "https://docs.google.com/spreadsheets/d/1IRb4prGgMTngEynE43AvtbhDJWxYp5mj6kAqoXZ3O1c/edit",
  "production-industrie":
    "https://docs.google.com/spreadsheets/d/14hxGrhgKmvVwi2hDgfvpoIj_5MyWQCntCrum-Ecx49A/edit",
  opticien:
    "https://docs.google.com/spreadsheets/d/1Y5xucGB1VYR9mgaghtJHdfEjbcKdv7E1vG8OaFFfFzo/edit",
  "reparation-informatique-mobile":
    "https://docs.google.com/spreadsheets/d/141GolGHKmeiodlgLT4Oag0izsknAiupsJ8WQnfTn61s/edit",
  "food-truck":
    "https://docs.google.com/spreadsheets/d/1bajbua9QbzR7BbN4Uwv9T2FMAEJe9l__RyLJTesUBo0/edit",
  "fast-food":
    "https://docs.google.com/spreadsheets/d/1361pkoJg5lIRzqIITtkpLRJrV9C1M9bdHJTebKKbRwA/edit",
  association:
    "https://docs.google.com/spreadsheets/d/1UfDMsanJisonen5FhemaLmx8UC3EPDBgGcW_Tt-EFpE/edit",
  "assistant-administratif-externalise":
    "https://docs.google.com/spreadsheets/d/1vck7xSY3Sps-PKBtmJk3mp6scVeCbLRrZgmFAcycXi8/edit",
  "auto-ecole":
    "https://docs.google.com/spreadsheets/d/1PpXP5_cMoD3xuW-_UFAoyJsl_oW8b8WBkNFCg-jfRg4/edit",
  boulangerie:
    "https://docs.google.com/spreadsheets/d/19dPItRbIxwkqJHSFnMxs16vuV7Jlz6q_B9y1YeQdpBU/edit",
  "consultant-independant":
    "https://docs.google.com/spreadsheets/d/1UCsrZLWdqK2hacju3d0R3vGGqoQCaaqCGobTAHyUL9M/edit",
  "coach-sportif":
    "https://docs.google.com/spreadsheets/d/10Rhl25jSUF2EF65jo7o3Tn4KldKGvbHiFgHlZFoOZm8/edit",
  esthetique:
    "https://docs.google.com/spreadsheets/d/1k0CLoflmb0Pjz-oGDOImP9dtyH8oalwEEkGjacIiiE0/edit",
  fleuriste:
    "https://docs.google.com/spreadsheets/d/1ecldvmUcc5FcjfYqpAE1w3nrwEzsZexIOOfiqAuJZ9A/edit",
  geometre:
    "https://docs.google.com/spreadsheets/d/1c7RVCT8RO2LsKYaRa22JBpN9h8tMj0kxmT_Sx4MVgkU/edit",
  "gestionnaire-de-patrimoine":
    "https://docs.google.com/spreadsheets/d/1njcpGOvPyxjB8vFKL3IkonLuuBYBr4Ze1hU7gp7zvwc/edit",
  "institut-de-beaute":
    "https://docs.google.com/spreadsheets/d/1uISQC-lgk-Z1XMnxLv5xUpZ0wDznI66_KqPTAEU3hZ8/edit",
  "investissement-immobilier":
    "https://docs.google.com/spreadsheets/d/165YRnh7RQlD6AGPHFhzfmVsdwB6PHIhKkEJbZEYaKQw/edit",
  "investissement-financier":
    "https://docs.google.com/spreadsheets/d/19YlJNFLjIZ6yiiSly4cHzumxywpMKhaZM46UmYTZEfg/edit",
  "investissement-entreprise":
    "https://docs.google.com/spreadsheets/d/1pJz24sdIn99CbNWScfCpSXxWIIrWMYkczkIPjoJinYk/edit",
  "investissement-locatif":
    "https://docs.google.com/spreadsheets/d/1fa4I_52Kb67-wwVked_wtyWcY2t-pZvr_mIwRg-SsuU/edit",
  "salon-de-coiffure":
    "https://docs.google.com/spreadsheets/d/1u7Jc7e8k8ieTcCtgBdZpHoAkhkHUo9k6h6aPDw12_g0/edit",
  osteopathe:
    "https://docs.google.com/spreadsheets/d/1jTOYEviY77seifxcsqwkKf3Jy_5CJ0yUoBITKCGFrPI/edit",
  psychologue:
    "https://docs.google.com/spreadsheets/d/1DDgOoJeY7vQNpdQCmMG2zldk0gwChcqaaYVhYmfQQSw/edit",
  "photographe-videaste":
    "https://docs.google.com/spreadsheets/d/1wq3PMusokw-ygWM0SmG5yR4eg5LEe3eyvATtp33bj6s/edit",
  restaurant:
    "https://docs.google.com/spreadsheets/d/1mQ_GEMFXeoazFJgF5ebk62RxdCrAOAoOflfGt5TiQtA/edit",
  evenementiel:
    "https://docs.google.com/spreadsheets/d/177pRqRiT0Cx2jc7qXHjskeCRsQJp8z226LdH7EfQ5ZE/edit",
  "marchand-de-biens":
    "https://docs.google.com/spreadsheets/d/1SY9bazlrgCgrroMze3xz9jcE5wrurtOFjI9URCBe1MQ/edit",
  "salle-de-sport":
    "https://docs.google.com/spreadsheets/d/1Go83i5omdkOPqyK26EhYmfQ4U3RAocsJw3TPCxk4pyk/edit",
  syndic:
    "https://docs.google.com/spreadsheets/d/1P5gBjJ24XdEf5LXdDVZOHoAgTNQ8ieWGydEpPg4zs4Q/edit",
  traiteur:
    "https://docs.google.com/spreadsheets/d/1zfRDDlnXKpeA_nEPFNpkJrfZSS7u7hPxFXj4xMmbm9c/edit",
  creche:
    "https://docs.google.com/spreadsheets/d/1UTy1QoDyLGY5rRin5ZL0mCoSYE8Ag1EXdAI0uiwfjbk/edit",
  "hotel-hebergement-independant":
    "https://docs.google.com/spreadsheets/d/1uKY1zb79mZf9Y_tZqaNOYfKOcs_9E6rEmzP70m3F--g/edit",
  marketplace:
    "https://docs.google.com/spreadsheets/d/16H6fMYFTa6GY-0weaEMw7aMRNAwYinApeQNhkDasSVY/edit",
  media:
    "https://docs.google.com/spreadsheets/d/1VHgTQR6b3sUVXr65tdyi1eZIi8JFz0jlmyYZMgXYRl8/edit",
  saas:
    "https://docs.google.com/spreadsheets/d/1qlJpu6vPz7Q2I7MJFLRV78kXAhCgJTyin4Kt8xWrSJc/edit",
  "e-commerce":
    "https://docs.google.com/spreadsheets/d/1TcgjRg3Ff_Dj3LFw-Uuj_mEZxkxnthHhGOC00oqz1Ss/edit",
  "commerce-de-detail":
    "https://docs.google.com/spreadsheets/d/1IU2Hi_wgzWHuw4J3bfVwN55cN1yMpEojl0q1C6RqR0U/edit",
  "commerce-alimentaire":
    "https://docs.google.com/spreadsheets/d/1cLZct6fu5OQKOEFR8lW2k9yoA_jYf-creJ-XnZsLaFk/edit",
  "boutique-specialisee":
    "https://docs.google.com/spreadsheets/d/1xxc4hPw3soN-a5wNe-Dn_rTrRrMRxx6HcPoDG6lETCc/edit",
  "tabac-presse-point-relais":
    "https://docs.google.com/spreadsheets/d/1vrooQQ19Tc9X3FYBjB6h2HSHyOEiF0VoUpe4eDJembI/edit",
  "bar-cafe":
    "https://docs.google.com/spreadsheets/d/1D3G1sJo94YUVfMehzPu6qNcjRwYJCZc7LyjHIQr4zC8/edit",
  "organisme-de-formation":
    "https://docs.google.com/spreadsheets/d/1g1MA7kT-wEF6DzA7qqZnsE-ytHutwQ_a5ig6-o9bln0/edit",
  cfa:
    "https://docs.google.com/spreadsheets/d/1yrY1G9i4HvDRad9IoFAi83w8OFDDQdOvkjlIijPkcLM/edit",
  "formation-en-ligne":
    "https://docs.google.com/spreadsheets/d/1tMTxH2dwX_0h7WGwpithPmxaZxrCO-zVOcMZ4QYp8YM/edit",
  "cabinet-medical":
    "https://docs.google.com/spreadsheets/d/17k_K8bpmTl8AKHWDZ6YFq-Tggri0T4EBPTO8xuCV1CM/edit",
  "cabinet-paramedical":
    "https://docs.google.com/spreadsheets/d/1HuP079tcNHQsRQ5MTrffrqxjyqPx7hdtWBdh5fvepHg/edit",
  "infirmier-liberal":
    "https://docs.google.com/spreadsheets/d/1aOFFRE5nxrGT2IOUoOxARGyl-961Ooi5vnb7ppa-vGA/edit",
  dentiste:
    "https://docs.google.com/spreadsheets/d/1CYzKS93Mxp38OwEG2Q8Cv0Na6d-ZFsJD3TMHLSiX9TU/edit",
  "diagnostiqueur-immobilier":
    "https://docs.google.com/spreadsheets/d/1IvQtD9xAKFO1F1d3kPKSdIiJ1mvc4w3XeAIPR0fKCyg/edit",
  "cybersecurite-pme":
    "https://docs.google.com/spreadsheets/d/1-YOB_kWCf7mUwWtrbqBMwVDOq-yBySeTBFGvRhRlqQw/edit",
  "coach-professionnel":
    "https://docs.google.com/spreadsheets/d/1XmT26JywgoKiUmjRR7L_eidgpr3vrD6ooya7TywbGwM/edit",
  notaire:
    "https://docs.google.com/spreadsheets/d/1tu64JaQ-1GzI3G-x2eQzf-VA2QbfpH23ALi_c2pYnCI/edit",
  "office-manager-externalise":
    "https://docs.google.com/spreadsheets/d/14lHWvqZEFIaE592xy3AhDarFwb2OM2Orvw638NVGcYI/edit",
  pharmacie:
    "https://docs.google.com/spreadsheets/d/1gp9dkNjO7XfCoNJpaYqKVdvxJYn3jH5Of9DjSs_9ByI/edit",
  "secretariat-externalise":
    "https://docs.google.com/spreadsheets/d/1qmcoO9pXZERg6SCZnenoXe-nBHXNC20bNCLLlQZpagA/edit",
  "gestionnaire-paie-independant":
    "https://docs.google.com/spreadsheets/d/1LcbspnthRbINhj2clk8ZcWpiamTYtDaRpuhvxHPz9GM/edit",
  "societe-recouvrement":
    "https://docs.google.com/spreadsheets/d/1rwdzarxVtubuQvBFfIC7SKQkmOJWCYVPLCari3iNudY/edit",
  "societe-domiciliation":
    "https://docs.google.com/spreadsheets/d/1O2Aneru5HhZXXRdbMNkyJffW6ul4QDQQ3CJlnt3QvGI/edit",
  "studio-branding-design":
    "https://docs.google.com/spreadsheets/d/1xi5Jgqy3HKgIYuVo4aCjyBbUjsXixL0h73Y-hrX5diE/edit",
  veterinaire:
    "https://docs.google.com/spreadsheets/d/1utHAzn-H0xAvFW5Y8G4bUYYGBtAJ3Q8jVpKGEYw6w3Q/edit",
  vtc:
    "https://docs.google.com/spreadsheets/d/1sTFRXvQebtA7S5U-K2aTgMeKyjcXhGhKqB2Nl6f5KNA/edit",
  "dark-kitchen":
    "https://docs.google.com/spreadsheets/d/1-FGCoBYIr_wchNlP8dEjG-BldVB0tamjUtvSBpwD-Ck/edit",
};

const globalDocumentModels: DocumentModel[] = [
  {
    slug: "suivi-previsionnel-financier",
    title: "Suivi et prévisionnel financier",
    seoTitle: "Suivi et prévisionnel financier pour TPE | Modèle Demaa",
    description:
      "L'outil indispensable pour piloter votre trésorerie, le nerf de la guerre de toute entreprise.",
    seoDescription:
      "Téléchargez un modèle de suivi et prévisionnel financier pour TPE afin de piloter budget, trésorerie et anticipation plus sereinement.",
    content: `
## Pourquoi ce modèle existe

Dans beaucoup de petites entreprises, la trésorerie est pilotée trop tard.

On regarde le compte bancaire, on réagit au fil de l'eau, puis on découvre les tensions une fois qu'elles sont déjà là.

Ce modèle sert à remettre de l'anticipation :

- suivre les entrées et sorties importantes ;
- visualiser les postes de dépenses ;
- projeter les mois à venir ;
- arbitrer plus tôt ;
- protéger le cash avant qu'il ne manque.

## Ce que vous allez trouver

- une base de budget simple à adapter ;
- une lecture plus claire des postes fixes et variables ;
- un support utile pour prévoir, comparer et ajuster ;
- un document exploitable seul ou avec un expert-comptable.

## Pour qui c'est utile

Ce modèle est particulièrement utile si vous voulez :

- sortir d'un pilotage à vue ;
- mieux cadrer votre budget ;
- préparer un investissement ;
- rassurer un partenaire financier ;
- prendre des décisions plus tôt.
    `.trim(),
    category: "Finance",
    date: "2026-01-11",
    image: "/images/academy/budget-1.png",
    slides: [
      "/images/academy/budget-1.png",
      "/images/academy/budget-2.png",
      "/images/academy/budget-3.png",
    ],
    ctaLabel: "Ouvrir le modèle",
    ctaHref:
      "https://docs.google.com/spreadsheets/d/1-7IDhGAtwNQJtZDYYvhDvM3VHfHVeGwOMTFKdAQuIOE/edit?usp=sharing",
    tags: ["modele", "budget", "tresorerie", "finance"],
    relatedSystemSlugs:
      RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG["suivi-previsionnel-financier"] ??
      [],
    featuredRank: 1,
  },
  {
    slug: "systeme-operationnel",
    title: "Système opérationnel",
    seoTitle: "Système opérationnel pour TPE | Modèle Demaa",
    description:
      "La structure dont vous avez besoin pour que votre activité soit plus stable, plus lisible et moins dépendante de votre mémoire.",
    seoDescription:
      "Découvrez un modèle de système opérationnel pour structurer le quotidien d'une TPE : priorités, process, ressources et routines de pilotage.",
    content: `
## Pourquoi ce modèle existe

Beaucoup d'entreprises avancent avec de bonnes intentions, mais sans structure claire entre ce qu'il faut faire, qui doit le faire et comment on le suit.

Ce modèle sert à poser une base concrète pour :

- clarifier les priorités ;
- mieux organiser les sujets récurrents ;
- documenter les process utiles ;
- rendre l'activité moins fragile ;
- mieux transmettre l'information.

## Ce que vous allez trouver

- une structure simple à adapter à votre activité ;
- un cadre pour organiser les sujets clés ;
- un support pour relier vision, exécution et suivi ;
- une base utile si vous voulez déléguer progressivement.

## Pour qui c'est utile

Ce modèle est particulièrement utile si vous voulez :

- arrêter de tout garder dans votre tête ;
- rendre vos routines plus solides ;
- mieux cadrer l'exécution ;
- préparer une montée en charge ;
- déléguer sans perdre le fil.
    `.trim(),
    category: "Organisation",
    date: "2026-02-12",
    image: "/images/academy/organisation-1.png",
    slides: [
      "/images/academy/organisation-1.png",
      "/images/academy/organisation-2.png",
      "/images/academy/organisation-3.png",
    ],
    ctaLabel: "Ouvrir le modèle",
    ctaHref: "https://airtable.com/app3fRlYVjiFAnrjW/shraiL72hO4EvQoh2",
    tags: ["modele", "organisation", "systeme", "pilotage"],
    relatedSystemSlugs:
      RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG["systeme-operationnel"] ??
      [],
    featuredRank: 2,
  },
];

const systemDocumentModels: DocumentModel[] = Object.entries(PILOTING_SHEET_URLS).flatMap(
  ([systemSlug, ctaHref]) => {
    const enterprise = enterpriseCatalogBySlug[systemSlug];

    if (!enterprise || !ctaHref) {
      return [];
    }

    return [
      {
        slug: `tableau-de-pilotage-${systemSlug}`,
        title: `Tableau de pilotage pour ${enterprise.name}`,
        seoTitle: `Tableau de pilotage ${enterprise.name} | Modèle Demaa`,
        description:
          `Un modèle de pilotage concret pour suivre les indicateurs, les postes clés et les arbitrages utiles dans une activité de ${enterprise.name.toLowerCase()}.`,
        seoDescription:
          `Accédez à un tableau de pilotage pensé pour ${enterprise.name.toLowerCase()} afin de suivre les bons repères, mieux anticiper et décider plus sereinement.`,
        content: `
## Pourquoi ce modèle existe

Dans ${enterprise.name.toLowerCase()}, le vrai sujet n'est pas seulement de travailler beaucoup.

Le vrai sujet est de savoir ce qu'il faut suivre pour piloter correctement l'activité.

Ce tableau de pilotage sert à :

- rendre les chiffres plus visibles ;
- suivre les postes importants ;
- repérer les écarts plus tôt ;
- mieux arbitrer semaine après semaine ;
- garder une base de pilotage plus simple à tenir.

## Ce que vous allez trouver

- un support directement exploitable ;
- une base structurée pour suivre l'activité ;
- un document pensé pour le métier ${enterprise.name.toLowerCase()} ;
- une aide pour piloter sans repartir d'une feuille blanche.

## Pour qui c'est utile

Ce modèle est utile si vous voulez :

- reprendre la main sur vos indicateurs ;
- mieux suivre votre activité ;
- poser des routines de pilotage plus régulières ;
- partager une base plus claire avec un partenaire ou un collaborateur.
        `.trim(),
        category: "Tableau de pilotage",
        date: "2026-03-01",
        ctaLabel: "Ouvrir le modèle",
        ctaHref,
        tags: ["modele", "pilotage", "tableau-de-bord", enterprise.slug],
        systemSlug,
        relatedSystemSlugs: [systemSlug],
      },
    ];
  },
);

export const documentModels: DocumentModel[] = [
  ...globalDocumentModels,
  ...systemDocumentModels,
];

function compareDocumentModels(left: DocumentModel, right: DocumentModel) {
  const leftRank = left.featuredRank ?? 999;
  const rightRank = right.featuredRank ?? 999;

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  if (left.systemSlug && !right.systemSlug) return 1;
  if (!left.systemSlug && right.systemSlug) return -1;

  return left.title.localeCompare(right.title, "fr");
}

export function getAllDocumentModels(): DocumentModel[] {
  return [...globalDocumentModels].sort(compareDocumentModels);
}

export function getDocumentModelBySlug(slug: string): DocumentModel | null {
  return documentModels.find((model) => model.slug === slug) ?? null;
}

export function getDocumentModelsForSystem(systemSlug: string): DocumentModel[] {
  return [...documentModels]
    .filter((model) => model.systemSlug === systemSlug || (!model.systemSlug && model.featuredRank))
    .sort((left, right) => {
      if (left.systemSlug === systemSlug && right.systemSlug !== systemSlug) return -1;
      if (left.systemSlug !== systemSlug && right.systemSlug === systemSlug) return 1;
      return compareDocumentModels(left, right);
    });
}

export function getRelatedSystemsForDocumentModelSlug(slug: string, limit = 6): System[] {
  const model = getDocumentModelBySlug(slug);

  if (!model?.relatedSystemSlugs?.length) {
    return [];
  }

  return Array.from(new Set(model.relatedSystemSlugs))
    .map((systemSlug) => enterpriseCatalogBySlug[systemSlug])
    .filter((enterprise): enterprise is NonNullable<typeof enterprise> => Boolean(enterprise))
    .slice(0, limit)
    .map(enterpriseToSystem);
}
