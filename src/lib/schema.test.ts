import { describe, it, expect } from "vitest";
import { toolJsonLd, organizationJsonLd, breadcrumbJsonLd } from "./schema";
import { tools } from "./tools";

const sample = tools[0];

describe("toolJsonLd", () => {
  it("returns a SoftwareApplication and an FAQPage", () => {
    const [app, faq] = toolJsonLd(sample);
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(faq["@type"]).toBe("FAQPage");
    expect(app["@context"]).toBe("https://schema.org");
  });

  it("advertises a free offer", () => {
    const [app] = toolJsonLd(sample) as [{ offers: { price: string; priceCurrency: string } }, unknown];
    expect(app.offers.price).toBe("0");
    expect(app.offers.priceCurrency).toBe("USD");
  });

  it("maps every FAQ into a Question/Answer entry", () => {
    const [, faq] = toolJsonLd(sample) as [
      unknown,
      { mainEntity: { "@type": string; name: string; acceptedAnswer: { "@type": string } }[] },
    ];
    expect(faq.mainEntity.length).toBe(sample.faqs.length);
    expect(faq.mainEntity[0]["@type"]).toBe("Question");
    expect(faq.mainEntity[0].acceptedAnswer["@type"]).toBe("Answer");
    expect(faq.mainEntity[0].name).toBe(sample.faqs[0].q);
  });

  it("produces valid JSON-LD for every tool", () => {
    for (const t of tools) {
      const ld = toolJsonLd(t);
      expect(ld).toHaveLength(2);
      // must be JSON-serializable
      expect(() => JSON.stringify(ld)).not.toThrow();
    }
  });
});

describe("organizationJsonLd", () => {
  it("builds Organization schema with absolute logo URL", () => {
    const org = organizationJsonLd("https://motionix.xyz");
    expect(org["@type"]).toBe("Organization");
    expect(org.logo).toBe("https://motionix.xyz/og/og-default.png");
    expect(org.contactPoint[0]["@type"]).toBe("ContactPoint");
  });
});

describe("breadcrumbJsonLd", () => {
  it("builds a BreadcrumbList with 1-based positions in order", () => {
    const bc = breadcrumbJsonLd([
      { name: "Motionix", url: "https://motionix.xyz/" },
      { name: "Tools", url: "https://motionix.xyz/tools" },
      { name: "Background remover", url: "https://motionix.xyz/tools/background-remover" },
    ]);
    expect(bc["@type"]).toBe("BreadcrumbList");
    expect(bc.itemListElement).toHaveLength(3);
    expect(bc.itemListElement[0].position).toBe(1);
    expect(bc.itemListElement[2].position).toBe(3);
    expect(bc.itemListElement[1].name).toBe("Tools");
    expect(bc.itemListElement[1].item).toBe("https://motionix.xyz/tools");
  });
});
