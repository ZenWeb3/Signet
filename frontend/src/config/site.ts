export const siteConfig = {
  name: "Signet",
  url: "https://signet.app",
  getStartedUrl: "#",
  ogImage: "/og.jpg",
  description:
    "A trustless dead-man's switch on-chain. Deposit funds, set a check-in interval, name a beneficiary — stay active and it's yours, go silent and it's theirs.",
  version: "v1.0",
  links: {
    twitter: "https://twitter.com",
    github: "https://github.com",
    email: "mailto:hello@signet.app",
  },
  pricing: {
    pro: "#",
    team: "#",
  },
  stats: {
    figma: 0,
    github: 0,
    cli: 0,
    total: "",
    updated: "",
    sections: 0,
    illustrations: 0,
    animations: 0,
    templates: 0,
  },
};

export type SiteConfig = typeof siteConfig;
