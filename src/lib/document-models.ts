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

const PILOTING_SHEET_URLS: Partial<Record<string, string>> = {
  batiment: "https://docs.google.com/spreadsheets/d/15zC4j67O86Tjy7Gro3_rG49NcfpHfv6L4ztlSPC6hxI/edit",
  "plomberie-chauffage":
    "https://docs.google.com/spreadsheets/d/1YiIS1FwchjbZIJZhdOKwnkyF183ScTohJtYU3JKhUpQ/edit",
  "electricite-generale":
    "https://docs.google.com/spreadsheets/d/1wIK28icOZUNLr0Fqd1XXeqDETmye7bx03BEl8h7RI8o/edit",
  "renovation-interieur":
    "https://docs.google.com/spreadsheets/d/1vym2WaTI5-jYCObTVY-IjlJgiNzPZfhnmlubVLBYrcw/edit",
  "menuiserie-agencement":
    "https://docs.google.com/spreadsheets/d/1BZlRXNjBl7rin8qtBujKfP9jlz3U7WGFWfl0phfhUOE/edit",
  "maconnerie-gros-oeuvre":
    "https://docs.google.com/spreadsheets/d/1vnNfd3ToRbulx4T1IC8l1MteIW3WY8A6Rh_f57HaSLI/edit",
  "architecte-maitre-oeuvre":
    "https://docs.google.com/spreadsheets/d/1lIae4RktHVbE5qam-v8xxd7D4FTi9GzjJP1VEhxZkSU/edit",
  "peintre-en-batiment":
    "https://docs.google.com/spreadsheets/d/1hEt5Luogd4Br54EnnkkOlyPGbU98hWS8_b9Y29zyf1w/edit",
  couvreur: "https://docs.google.com/spreadsheets/d/1Z9rtlvbctwJ5-0Q1mbI5NQY-csjDgQpTrXLYQZ3Fd04/edit",
  carreleur: "https://docs.google.com/spreadsheets/d/1W2bR1be6kC-4Hwwt3f5STPSpxDrAU129KrcJWRv5Qdk/edit",
  climatisation:
    "https://docs.google.com/spreadsheets/d/1RaKZz3uwMlyynBazp9mCGodEtIZpjyqABqDmbvdWFEk/edit",
  paysagiste: "https://docs.google.com/spreadsheets/d/1B6PFcrVwndpkMgT0qsychFSMCgbmubY2kMcTzVps4rY/edit",
  pisciniste: "https://docs.google.com/spreadsheets/d/1k5C2uQvzdHlizBDFvgf0u8YYTKCrkC80p01SQU2IMKg/edit",
  serrurier: "https://docs.google.com/spreadsheets/d/1_0QDJzZPLfXKgeNxbJiUeIc5L4v-Xn6KHXhY3HL4nwY/edit",
  "garage-automobile":
    "https://docs.google.com/spreadsheets/d/13oKctvU0UGzTiRQ0zciPZw3rjXQD-89B8pLlUC6xxj4/edit",
  carrosserie:
    "https://docs.google.com/spreadsheets/d/1tI7i3OZEsF0XxYm_v_Q87Yx5scmHGhRVUdNgjaZu8oI/edit",
  demenagement:
    "https://docs.google.com/spreadsheets/d/1WNwj5RJWV0OGWyfqkmA6NYC6VpQNMG0EjzTBiEqVBro/edit",
  "livraison-dernier-kilometre":
    "https://docs.google.com/spreadsheets/d/1czeJMNCDC7trzONXPKTn4H12CIDAePL8lTlk4O7zj8Y/edit",
  "transport-de-marchandise":
    "https://docs.google.com/spreadsheets/d/1uwYf5G1i-7G0gyJvfc2xFc-34ShY1E5V6vNkz-68_Uk/edit",
  "transport-de-personnes":
    "https://docs.google.com/spreadsheets/d/1ertGlYSt9SDPt2gw-WZCFBEI-BVAZUEczv-bOTdz0cc/edit",
  "nettoyage-professionnel":
    "https://docs.google.com/spreadsheets/d/1My7zy6ZHm0Its0iw6kYYFN_eKEgC7ngW30naQOnwslI/edit",
  "entreprise-de-securite":
    "https://docs.google.com/spreadsheets/d/1_h6xfgC7sbhVMVS-5JJWfSruJw5_UbhGAb39Cp2bGX4/edit",
  "services-a-la-personne":
    "https://docs.google.com/spreadsheets/d/1Yj9nCqdSAo960DqrZXKLKW3baYq3TQ0Mo3jgBQ-IB10/edit",
  "aide-a-domicile-menage":
    "https://docs.google.com/spreadsheets/d/1-372p5VzX-s-sULK5Tppa7AqZ8pH4mCgfJBGAKocpgs/edit",
  pressing:
    "https://docs.google.com/spreadsheets/d/1yUD0mdaRj3DpVmPhgmCWVTWNmqo2AP3-NfSt4OaLfGI/edit",
  librairie:
    "https://docs.google.com/spreadsheets/d/15mzsEaKFVnicHxK318zp-19cOBGUQF2PmKysCjLIkh4/edit",
  "laverie-automatique":
    "https://docs.google.com/spreadsheets/d/10OtpjlnwgKjctMNtyZ4dKEw2BXz36Em-BCdd9jyCSmc/edit",
  "agence-de-voyage":
    "https://docs.google.com/spreadsheets/d/1tycv2ymbAUj0uR-2KQwdDkL1n3IvyBwedX5OtZ6lslw/edit",
  "agence-marketing":
    "https://docs.google.com/spreadsheets/d/1mOhRDUnuxh5y2xQMIsrhY-I3b_b1hC40d89kZyzwnvk/edit",
  "agence-de-recrutement":
    "https://docs.google.com/spreadsheets/d/1_leHlVSML48rvchBUCa87ljS2bWq5terVVzFgpfOOuI/edit",
  "agence-acquisition-paid-ads":
    "https://docs.google.com/spreadsheets/d/1hTaMgGnOMtC9D7e6IB0-7KxpeJv3D_U6Q7MBT0bP8g4/edit",
  "agence-seo":
    "https://docs.google.com/spreadsheets/d/1yIoLTTp9qQ8BooIAZX3Mu7FJanddcdijSerIBiUKQYQ/edit",
  "agence-web":
    "https://docs.google.com/spreadsheets/d/177K0urwI0ST7EVIMDI8L2HgZuRSDHNvhSvJRh0riK-g/edit",
  "agence-immobiliere":
    "https://docs.google.com/spreadsheets/d/1zfDCbfHuHKgIVMwcgdESVl6u8di6g2KIvt6N_MWmWEk/edit",
  "cabinet-assurance":
    "https://docs.google.com/spreadsheets/d/1WRnPcNFpHDrTOgDp4ZhUCII5jmf_XarT_vsCC5oSQfY/edit",
  "cabinet-comptable":
    "https://docs.google.com/spreadsheets/d/1Isk2iBJD8xEZPea8i6mVfMGwIBAGvX1vLrfOXeMLzRI/edit",
  "cabinet-davocat":
    "https://docs.google.com/spreadsheets/d/1suIVepYkVf_fXbusf5_m1Rh1aD7uPGmHkVOqruM7rp8/edit",
  "cabinet-de-conseil":
    "https://docs.google.com/spreadsheets/d/1UbKPfWQQ8LWJ6-WI4_VFk-mmJjuJ4rz-na7M3RWHzvE/edit",
  "cabinet-etudes":
    "https://docs.google.com/spreadsheets/d/1PvMBPHa89ZWH5qwqpIgwJnNdbs89r99AGX89DgWOkcA/edit",
  "cabinet-rh-externalise":
    "https://docs.google.com/spreadsheets/d/1Seyq4ikKcw6HPlcNr1qHCGDU75pe4BKrS3Gv-PouFpg/edit",
  "cabinet-qhse-conformite":
    "https://docs.google.com/spreadsheets/d/1vdRBjW6lj30kMJcdzjwMyqsa_N5o7FrpFCfi3zDQHzc/edit",
  "bureau-etudes":
    "https://docs.google.com/spreadsheets/d/1e2xwc4KvLzauvpmRt1qBJhHy8NLLDn2HSzhoT1oPOLA/edit",
  "centre-appels-support-client":
    "https://docs.google.com/spreadsheets/d/1lSqEz4rLXjRAWWo_dYLtCXM5LfTE70TANcKB0b2M0QM/edit",
  "centre-affaires-coworking":
    "https://docs.google.com/spreadsheets/d/1V3-r8Plyn-ITiSXY_uObFE6nyEEW2MosIvIziX_lKrg/edit",
  "conciergerie-airbnb":
    "https://docs.google.com/spreadsheets/d/1vKm8-1M0ciuk3v3Nih3MRtKDHE6sFKcYqsV7dHpMebY/edit",
  "consultant-data-bi":
    "https://docs.google.com/spreadsheets/d/1hpgZlKkmpFC974nl_kQtniICbIq43JS7__mpXnDbUjA/edit",
  "creation-de-contenu":
    "https://docs.google.com/spreadsheets/d/1WZ29VE9rdzuI9zIyEp5lWe6QGLbpn5I9VIcvg79pRLg/edit",
  "courtier-credit-assurance":
    "https://docs.google.com/spreadsheets/d/104giaxJw1G1XxzzNqV7iMuTRUn6GRmsZmOYfjf5K3DY/edit",
  "chasseur-immobilier":
    "https://docs.google.com/spreadsheets/d/1cZMEnEP0lNbiHynPy_8aZLBcKjnnfFyc-HNTsHTLsJY/edit",
  "daf-externalise":
    "https://docs.google.com/spreadsheets/d/1xWLlfpkgJguVaenCXGW8aBPaZRnogrxmz168MHvajP4/edit",
  freelance:
    "https://docs.google.com/spreadsheets/d/1fwS9WaKU7i5Cp89XoFqNWy-Gd5aUEpm14rI30t1uF5M/edit",
  "gestion-locative":
    "https://docs.google.com/spreadsheets/d/1ti1-lqv0ZXnDf5Rtj0c9_nTi4ydGNM0dqp-pJptmvLs/edit",
  "infogerance-informatique":
    "https://docs.google.com/spreadsheets/d/1VmGZTgoefftzCW_kWB6UNvqfU3oM1ZfpBhdlH4mEH5U/edit",
  "integrateur-crm-erp":
    "https://docs.google.com/spreadsheets/d/1vU6CidLqCJkdkaJQEI3DWNaXEuEfhfzwBCE3K6uM-54/edit",
  "production-industrie":
    "https://docs.google.com/spreadsheets/d/1Wsv6O2uFwscJI_d9SlcnS0anKX5xwpLN3Vpg3Bq4ytY/edit",
  opticien:
    "https://docs.google.com/spreadsheets/d/16C-JvRzTvEH9v94H1DZFJANYbUfC_qv1PXCFgTqbegU/edit",
  "reparation-informatique-mobile":
    "https://docs.google.com/spreadsheets/d/1_xcOcXl_THVg4egK-9I-52ixg_B31XcsfvjxZZ4TMv0/edit",
  "food-truck":
    "https://docs.google.com/spreadsheets/d/15ckn0GWhIGhGM-8YJ1yaGhGg5zBxRehHGZE2I6AzzvE/edit",
  "fast-food":
    "https://docs.google.com/spreadsheets/d/14pmt6Vb6dzZj_WanFXP4Vrj0yJQ-WI7Uub3bNfjRZCs/edit",
  association:
    "https://docs.google.com/spreadsheets/d/1v32FuEomEQtbXOH8IRprH69JKJYvJkyL6dI4GgKvGhk/edit",
  "assistant-administratif-externalise":
    "https://docs.google.com/spreadsheets/d/19NBiSorbtQPPCVMiOUwabvpWg00YVSm8Ty7vYk6Yp4w/edit",
  "auto-ecole":
    "https://docs.google.com/spreadsheets/d/1a7EpQKobVx1EPswsfZq9CeELaj6_oQU0R-s0M-TXvmg/edit",
  boulangerie:
    "https://docs.google.com/spreadsheets/d/1mWYU4m1ugsQnF1Y46gsZ-nhcYSgUNjfAyknBYdgN0nQ/edit",
  "consultant-independant":
    "https://docs.google.com/spreadsheets/d/1WoZfoHToqWYntmyFd3VIr7kqQW8EqfGrAL6AJoSMjvc/edit",
  "coach-sportif":
    "https://docs.google.com/spreadsheets/d/14iLpwdOMg7kevNVFDv5VB9ECjK4XzSrBeY5UWOW9nXU/edit",
  esthetique:
    "https://docs.google.com/spreadsheets/d/1QHzhE2hKTHhO1_mpwRVf_P-O3pOabEEAfhPpCEDNsxA/edit",
  fleuriste:
    "https://docs.google.com/spreadsheets/d/1EslHRazSAN0oveHJfFdTKaEuepmWvdIXWq66Pw3IWbE/edit",
  geometre:
    "https://docs.google.com/spreadsheets/d/191IjC_8GJxbKxQQLiWEJLjbvNF8isfg9QIS9p5UwN5M/edit",
  "gestionnaire-de-patrimoine":
    "https://docs.google.com/spreadsheets/d/1nbUUk6kadJ_dLZsKtNqzWNdWaE6cbIfZEPQGvPomGnw/edit",
  "institut-de-beaute":
    "https://docs.google.com/spreadsheets/d/13lUrOhMHJ8bF4wNyBNEiFL9EiC5qHJNu83M3ak8B6Js/edit",
  "investissement-immobilier":
    "https://docs.google.com/spreadsheets/d/1QmesN9bz3WNgf8ubrpRmuC670lBd-sNR_x9nya9MYJw/edit",
  "investissement-financier":
    "https://docs.google.com/spreadsheets/d/1Hg3ITz6FJ48Ux9t79acME_wCoZC2gVMqHGGq4hbHGpY/edit",
  "investissement-entreprise":
    "https://docs.google.com/spreadsheets/d/1Zsi4S9eEBuwfVxM_EgcDLAxykFo3FkRnDg5lNr1ij8U/edit",
  "investissement-locatif":
    "https://docs.google.com/spreadsheets/d/1OxOTfr34g07cvQKv62h3MlfVIdl5jRNWq0t8qY5doz0/edit",
  "salon-de-coiffure":
    "https://docs.google.com/spreadsheets/d/12tXehH0mQLIim6mFjhXAeLXVg_CHNOhz0Faizjxs9hc/edit",
  osteopathe:
    "https://docs.google.com/spreadsheets/d/1AcTNuGmolQ59U1P-A28gMrTBdK6NJt4_3SxUJd73PPk/edit",
  psychologue:
    "https://docs.google.com/spreadsheets/d/1U-_ZhRGgZ4fe3qSaRbaN5dhzfiLRaoPPLX4_Du6tdiM/edit",
  "photographe-videaste":
    "https://docs.google.com/spreadsheets/d/1u29b4wPvt72aUo4JRT_dSCl059DY-7JoW1KLCLrDwXA/edit",
  restaurant:
    "https://docs.google.com/spreadsheets/d/1jJaSYip1xXLANSaJYD6mQ_c6YxBLlcVUpw-zvKhwqV4/edit",
  evenementiel:
    "https://docs.google.com/spreadsheets/d/1YH8HpXkEABajxTFjfjd7A5x_3MNAgM6R4eE92ZmhtwA/edit",
  "marchand-de-biens":
    "https://docs.google.com/spreadsheets/d/1DlKJa1T24K-GWg2r7JjkiiVrHmUslWvh5wNdCNPmiVk/edit",
  "salle-de-sport":
    "https://docs.google.com/spreadsheets/d/1UyZaofCW0J6o0R9hyj4afJye4MYmnzBxNfvXHwN0e8Y/edit",
  syndic:
    "https://docs.google.com/spreadsheets/d/1kiTjrf6L208UIVptV5XZQbtjCJ8vHA4lpTzJNDdMdvQ/edit",
  traiteur:
    "https://docs.google.com/spreadsheets/d/1ikxhfhnLFpSKDa5RsxCLT9GBSHCksoeaj3tsi2eDcFo/edit",
  creche:
    "https://docs.google.com/spreadsheets/d/154J4Mb0tkJRZbSmV6qc-mF6lZUFUYqeHZvVnbBwVQbc/edit",
  "hotel-hebergement-independant":
    "https://docs.google.com/spreadsheets/d/1IpG7ky_M2vOcn4ByC38fgBuaZniUeaEyapDK4n2HrCU/edit",
  marketplace:
    "https://docs.google.com/spreadsheets/d/1Jrm0g0FUcgPf5uZfOmi3aqsR28o7dZa6cqatrT9AfEc/edit",
  media:
    "https://docs.google.com/spreadsheets/d/12xdV1NrbbNi1gkNFTTnd4Oam_G_D5F5w1FFJ0plylT4/edit",
  saas:
    "https://docs.google.com/spreadsheets/d/1xehy8UifVcG0H2lQU94OWcc58d8vqgySjuKs5lTg0kA/edit",
  "e-commerce":
    "https://docs.google.com/spreadsheets/d/1wxAn6FtUzJaTzi88GXMzwoFvVjnFbwgqDCagfwP7_-c/edit",
  "commerce-de-detail":
    "https://docs.google.com/spreadsheets/d/1n8nXLKLznvxU_9faoucMe7enNTqFX7Z0YkH3X8CalQY/edit",
  "commerce-alimentaire":
    "https://docs.google.com/spreadsheets/d/1tUcJsi2TWpQdC22PBc3UoeavlG46ZXT5HasZ_m1amHQ/edit",
  "boutique-specialisee":
    "https://docs.google.com/spreadsheets/d/1KnS7JJgq_dMU_PQxY0kQUDi82eff0izGSlVai84HsTM/edit",
  "tabac-presse-point-relais":
    "https://docs.google.com/spreadsheets/d/1pxMll_0V40V23S1LbZfIzMVrLKiSESzHH5mg8UoDtVE/edit",
  "bar-cafe":
    "https://docs.google.com/spreadsheets/d/19X49lCa4uEU6PmDJCrKKzOm9m0XlTNyeTV_oXnffK4U/edit",
  "organisme-de-formation":
    "https://docs.google.com/spreadsheets/d/1l6DZlK5M83Y36cCTTJSOJP7cvgccAgZl1vUBeLfPLM0/edit",
  cfa:
    "https://docs.google.com/spreadsheets/d/1vet_NXyKEDM1l4hD-4fiEWjMI5yJi5Qdy88u_BgPm-Y/edit",
  "formation-en-ligne":
    "https://docs.google.com/spreadsheets/d/1PjkyuU2ZP69LrBLg3gqQbiBKO_u27g4ke_Yma3XDxa8/edit",
  "cabinet-medical":
    "https://docs.google.com/spreadsheets/d/1HzReMu8X7ZjS6EVWdq2JliD6FGqrHTvcYMQeHcOPwOA/edit",
  "cabinet-paramedical":
    "https://docs.google.com/spreadsheets/d/1NZ_dSNk0pW_K2uu2pTKjC_PJWTodkbOaEEy6xd9iuqo/edit",
  "infirmier-liberal":
    "https://docs.google.com/spreadsheets/d/1ECvs5fwIspTv5lzV_QhFXhkFK6sTFERebvxmTlaLxhI/edit",
  dentiste:
    "https://docs.google.com/spreadsheets/d/11tvnSwsahyiWhv5OXZSyJF9R2HKv6XUIjSF11VnLaf8/edit",
  "diagnostiqueur-immobilier":
    "https://docs.google.com/spreadsheets/d/18MdXVZSoAm5Li3edKZWKwOjDeUKxS7pQJHnVwTY-2L4/edit",
  "cybersecurite-pme":
    "https://docs.google.com/spreadsheets/d/1lFlxFRmzhgOWkOLDVxtGIQ4Qfeej6-CHjzPttnIfAhE/edit",
  "coach-professionnel":
    "https://docs.google.com/spreadsheets/d/1jLrI43_0m0n8MVW5B5zf3Xif1SFYkw-lwfHRarALEC8/edit",
  notaire:
    "https://docs.google.com/spreadsheets/d/1TgpvP7YteAmHuzKQ7JgPZvQmwuHrg3o72IZ3RJEiEQQ/edit",
  "office-manager-externalise":
    "https://docs.google.com/spreadsheets/d/19eBa4TmMOFlKwGfKL4Lc-t3BlGzkiyMaberhE0X1hrg/edit",
  pharmacie:
    "https://docs.google.com/spreadsheets/d/1zPxMWgBgkpUJx3P1wslGd9kDFMuHJQK7cfkMe5TWcm0/edit",
  "secretariat-externalise":
    "https://docs.google.com/spreadsheets/d/1ChMwRO9EWmAdZBUNKqvyfWLuj1SmmWVIu0aJfTsILsY/edit",
  "gestionnaire-paie-independant":
    "https://docs.google.com/spreadsheets/d/1r3kdgK3uxR1bVVw0x9KsXenTxKjDaVZjkWd7d7nHLhk/edit",
  "societe-recouvrement":
    "https://docs.google.com/spreadsheets/d/1slA137dMdGvUnr4y8qhdWjAqXnN7V1Wet9DsiGkahOA/edit",
  "studio-branding-design":
    "https://docs.google.com/spreadsheets/d/13G_06l-Z2R_G5PX-GlZfA68dsX3J3k_utv8DJtf4Ejs/edit",
  veterinaire:
    "https://docs.google.com/spreadsheets/d/1j_wmlcr-rdxvQ9ObNNHZQtIEKyfeUOWRA46Qw8G-SSA/edit",
  vtc:
    "https://docs.google.com/spreadsheets/d/1PSRaaviuT4evYmzlstuhBx3nlwuf3GiTGRvFGwj-uvg/edit",
  "dark-kitchen":
    "https://docs.google.com/spreadsheets/d/1ljzXVzPjqPIW3c7uebc2ExwK9ySrAv3SnPWTbf-mgTw/edit",
};

export function getPilotingSheetSlugs(): string[] {
  return Object.keys(PILOTING_SHEET_URLS);
}

export function getPilotingSheetCopyUrl(systemSlug: string): string | null {
  const sheetUrl = PILOTING_SHEET_URLS[systemSlug];

  if (!sheetUrl) {
    return null;
  }

  return sheetUrl.replace(/\/edit(?:\?.*)?$/, "/copy");
}

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
    slug: "pilotage-marketing-vente",
    title: "Tableau de pilotage Marketing & Vente",
    seoTitle: "Tableau de pilotage Marketing & Vente pour TPE | Modèle Airtable Demaa",
    description:
      "Une base Airtable pour structurer votre pipeline commercial, vos relances et le suivi des conversions.",
    seoDescription:
      "Découvrez un modèle Airtable pour structurer le marketing et les ventes d'une TPE : pipeline, actions, relances et conversions.",
    content: `
## Pourquoi ce modèle existe

Beaucoup d'entreprises multiplient les actions commerciales sans vision claire des opportunités, des relances et des conversions.

Ce modèle sert à poser une base concrète pour :

- centraliser les prospects et les opportunités ;
- organiser les actions marketing et commerciales ;
- planifier les relances ;
- suivre les étapes du pipeline ;
- mesurer les conversions.

## Ce que vous allez trouver

- une structure Airtable simple à adapter ;
- un pipeline commercial lisible ;
- un suivi des actions et des relances ;
- une base commune pour piloter Marketing & Vente.

## Pour qui c'est utile

Ce modèle est particulièrement utile si vous voulez :

- arrêter de perdre des opportunités faute de relance ;
- rendre votre acquisition plus régulière ;
- mieux suivre la conversion ;
- partager un pipeline clair avec votre équipe ;
- piloter les prochaines actions commerciales.
    `.trim(),
    category: "Marketing & Vente",
    date: "2026-02-12",
    image: "/images/academy/organisation-1.png",
    slides: [
      "/images/academy/organisation-1.png",
      "/images/academy/organisation-2.png",
      "/images/academy/organisation-3.png",
    ],
    ctaLabel: "Ouvrir le modèle",
    ctaHref: "https://airtable.com/app3fRlYVjiFAnrjW/shraiL72hO4EvQoh2",
    tags: ["modele", "marketing", "vente", "pipeline", "airtable"],
    relatedSystemSlugs:
      RELATED_SYSTEM_SLUGS_BY_CONTENT_SLUG["pilotage-marketing-vente"] ??
      [],
    featuredRank: 2,
  },
];

const documentModels: DocumentModel[] = [...globalDocumentModels];

function compareDocumentModels(left: DocumentModel, right: DocumentModel) {
  const leftRank = left.featuredRank ?? 999;
  const rightRank = right.featuredRank ?? 999;

  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  return left.title.localeCompare(right.title, "fr");
}

export function getAllDocumentModels(): DocumentModel[] {
  return [...globalDocumentModels].sort(compareDocumentModels);
}

export function getDocumentModelBySlug(slug: string): DocumentModel | null {
  return documentModels.find((model) => model.slug === slug) ?? null;
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
