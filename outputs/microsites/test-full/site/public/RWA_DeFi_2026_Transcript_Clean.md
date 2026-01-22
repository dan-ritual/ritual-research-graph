# RWA + DeFi '26 Overview
## Internal Strategy Meeting Transcript

**Date:** January 15, 2026
**Participants:** Emperor, Qt, Hans, Jody Rebak, Wally, Niraj Pant, Junyi, Akilesh Potti, Arshan, Bperszyk, Wooglin, Kartik

---

## Part 1: Market Context & Evolution

**Wally:**

Tokenized assets now exceed $35 billion in total value. Before diving into what we think are the key drivers, it's worth reviewing how the space has evolved since DeFi Summer in 2021.

### DeFi Summer Origins (2021)

In 2021, the initial experimentation centered around protocols like **Compound** and **Aave**, where the main paradigm was overcollateralized lending—essentially letting consumers borrow against their crypto collateral.

There was a movement toward enabling riskier or more "long-tail" assets. Protocols like **Cream Finance** emerged, pushing in that direction.

As many of you know, a series of risk events caused the industry to course-correct. Protocols started integrating risk controls. We saw the emergence of protocols like **Morpho** and **Euler** that compartmentalized individual asset risks.

### Early RWA Landscape

There's a parallel to how RWAs are evolving. One of the earlier players was **Maple Finance**. They wanted to do under-collateralized lending for institutions. However, the industry lacked mature infrastructure—proper tooling to price risk, sufficient analytics to scale appropriately.

Maple experienced significant defaults and subsequently pivoted toward asset-backed, properly collateralized lending. This shift from under-collateralized to fully collateralized is a broader trend we're seeing across the space.

---

## Part 2: Catalysts for RWA Growth

### Macro & Regulatory Tailwinds

Two main factors sparked the current RWA acceleration:

**1. Interest Rate Normalization**

When the Fed normalized the risk-free rate to approximately 4-5%, it created immediate demand. Previously, savings accounts yielded 1-2% at most. Suddenly, there was a low-risk way to capture 4-5% yields via tokenized treasuries. This represented one of the initial major demand drivers for RWAs.

**2. Pro-Crypto Regulatory Shifts**

The regulatory environment has become more favorable. Key developments include:
- Pro-crypto administration initiatives
- The GENIUS Act
- Various supportive policy frameworks

These developments are driving institutional adoption.

### BlackRock & Institutional Entry

One of the biggest institutional adopters has been **BlackRock** with their **BUIDL** fund. You can think of **Ondo Finance** as the provider tokenizing these institutional assets, making them accessible on-chain.

This single event—BlackRock's entry—really kickstarted the acceleration of RWAs in 2025.

---

## Part 3: Current RWA Limitations & Opportunities

### The Composability Gap

When RWAs were initially conceived, the focus was primarily on bringing off-chain assets on-chain—treasuries, real estate, etc.—in a one-to-one manner. There wasn't much focus on:
- Making assets composable
- Leveraging crypto-native features
- Assets originated on-chain

**This is changing now.** Junyi and I found several interesting use cases that are uniquely crypto-native.

### Multi-Chain Infrastructure

The RWA stack is now clearly multi-chain:

**Ethereum** has established itself as the trusted institutional settlement layer—effectively "king-made" by BlackRock choosing it for settlements.

**Layer 2s** are facilitating institutional adoption through different approaches:

| Protocol | Approach | Focus |
|----------|----------|-------|
| **Provenance** | Compliance-first | Making on-chain activity legally compliant; built-in KYC |
| **Plume** | Standardization | Creating a standard RWA stack; interoperability across DeFi |

---

## Part 4: AI/Intelligence Layer Opportunity

### Current State

Even today, most RWA protocols haven't leveraged on-chain AI features. In our research, only a couple mentioned AI analytics—and most of that is off-chain and non-transparent.

**Bid.io** is the only protocol we found doing AI-related work—specifically as an AI oracle for pricing RWA-related risks. However, they're essentially a specialization of what Ritual can provide.

### Concrete Use Case: Zivoe

**Zivoe** connects DeFi liquidity to merchant cash advance markets. Think of it as: you're a retail shop wanting to borrow money, but instead of fixed repayment schedules, a portion of your actual sales goes toward repayment.

This creates an interesting structure—you only pay when you make money. As Junyi noted, this is conceptually similar to **Alchemix** (self-repaying loans).

**The Problem:** When loans are fulfilled, you have idle capital sitting in the protocol.

**The Opportunity:** AI could scale loan origination, ensuring capital is deployed efficiently rather than sitting idle. Automating manual processes in loan origination is a clear use case for an intelligence layer.

---

## Part 5: Protocol Landscape

### Key Players by Category

**Legacy/Pivoted:**
- **Maple Finance** - Started with under-collateralized loans; pivoted to asset-backed secure lending; performing well

**Private Credit:**
- **Clearpool** - Established player in the space
- **Credix** - Credit markets infrastructure
- **Zivoe** - Merchant cash advance model; 3.6% annualized returns; revenue-to-TVL among highest we saw

**Profitability Analysis:**
Most protocols we analyzed showed annualized returns between 1-3%. Zivoe is on the higher end (~3.6%). Note: Zivoe is newer (less than a year old) with approximately $6M deposits, 95% utilization, generating ~$1M in revenue.

**Real Estate/Commodities:**
- **Tether Gold** - Commodity tokenization
- **Parcl** - Real estate price feeds for hedging exposure; prediction market-adjacent

**Infrastructure:**
- **Plume** - RWA-specific borrow/lend platform; standardization focus
- **Provenance** - Compliance and legal framework focus

---

## Part 6: Deep Dive - Interesting Protocols

**Junyi:**

Let me share some protocols that have consistently come up during our cross-chain research. I'd encourage everyone to think about how Ritual could be utilized across these.

### Protocol 1: Provenance (Figure Markets)

This one is controversial—you may have seen discussion on X a few months back.

**Background:**
- Founded by the team behind Figure Markets and X-SoFi
- Claims **$20 billion TVL** (though DeFi Llama has been unable to fully verify this on-chain)
- $15 billion is reportedly **home equity lines of credit (HELOCs)** tokenized on-chain
- $600 million in **tokenized insurance**

**Why It Matters:**
Figure Markets is aggregating multiple RWA types—HELOCs, insurance, and now (announced yesterday) the ability to **borrow and lend against tokenized stocks**.

**Products:**
- **Prime**: Allows lenders to access collateral that isn't just crypto—actual real assets like homes
- **Insurance Vertical**: Grew from $100M (2025) to $600M in tokenized insurance policies; enables automatic payouts triggered by off-chain events (hurricanes, natural disasters, death of relatives)

**Ritual Opportunity:** Verification of off-chain events for insurance payouts is a clear use case.

### Protocol 2: Zivoe (Credit Derivatives Model)

Think of Zivoe as a form of **synthetic credit derivatives** where on-chain participants can lend to real-world small businesses and consumer loans.

**Key Mechanism:**
They crunch loans into **senior and junior tranches**, creating leverage for junior tranche holders—this is how they push up yields.

The "spigot mechanism" means rather than time-based repayment obligations, borrowers repay via streaming revenue. If you're a business selling ice cream, a fraction of each sale goes toward repaying the loan. No revenue = no repayment obligation.

**Size:** Relatively small (~$6M TVL), but interesting model.

### Protocol 3: Credix Co-op (Future Cash Flow Collateralization)

**Key Innovation:** Allows businesses to **collateralize future cash flows**.

**Example - Rain:**
Rain powers infrastructure for crypto cards (including **EtherFi cards**, one of the biggest). As a service provider, Rain has predictable revenue streams.

**How It Works:**
1. Businesses undergo KYC
2. They prove and project future cash flows
3. Smart contracts are deployed
4. Businesses stream actual cash flows (month 1, month 2, month 3) into these contracts
5. Users (lenders) provide stablecoins against these contracts

**Yields:** Were in the twenties (20%+) last year.

**Extension Potential:** This model could extend to salary collateralization—individuals borrowing stablecoins against future paychecks.

---

## Part 7: Emerging Themes & Ritual Opportunities

**Junyi:**

Some areas we didn't have time to cover but are worth noting:

### On-Chain Prime Brokerage

**Upshift** and similar protocols are enabling on-chain prime brokerage services. This opens potential for:
- Verification of off-chain events and data
- AI-powered lender-borrower matching based on credit scores
- Automated risk assessment

### Summary of Ritual Integration Points

| Use Case | Primitive Required | Confidence |
|----------|-------------------|------------|
| Insurance payout verification | HTTP Calls, ONNX | High |
| Credit scoring / risk pricing | ONNX Inference | High |
| Lender-borrower matching | Native LLM, ONNX | Medium-High |
| Loan origination automation | Scheduled Tx, HTTP | High |
| Off-chain event verification | HTTP Calls, TEE | High |

---

## Part 8: Q&A Discussion

**Akilesh:**

You did a solid job with only two days. I want to start by asking about the Alchemix comparison on the Zivoe side. I personally think self-repaying debt makes a ton of sense structurally. Is Zivoe the only place you saw this, or was that primitive more broadly distributed?

**Wally:**

Junyi can speak to the specifics, but the whole idea is that rather than having a time-based obligation, repayment is based on your streaming revenue. If you're a business and you sell an ice cream cone, a fraction of that sale goes into repaying your loan. If you don't make money, you don't pay back the loan.

**Credix Co-op** uses a similar mechanism but is much larger and focuses on different sectors—including real estate.

**Junyi:**

Right. One of Credix's biggest clients is Rain, which powers crypto cards like EtherFi. Rain is essentially a service provider—as EtherFi makes money from transaction fees, Rain earns revenue as the infrastructure layer. You can imagine that income stream being directed toward loan repayment.

---

### Parcl & Positive Carry Collateral

**Akilesh:**

The Parcl stuff you mentioned is interesting. When you think about the physical real estate market—like the Case-Shiller index—a lot of people ask me, "Do you want to hedge?" And when you think about sourcing the locate for that hedge, the interest rate you pay for locates to short could potentially be financed by positive-carry collateral.

So it's kind of like a duality—you can effectively match the positive carry the platform generates against the asset you're shorting. The funding rate is just an interest rate, and at that point, the whole thing becomes a self-repaying construct.

**Wally:**

So you're saying if there's some sort of positive-carry asset that would pay off the actual fees required to hold the short position?

**Akilesh:**

Exactly. Most people get long volatile assets. Some people do the perp trade to actually generate yield—that's exactly the use case. And if they have the spot generating positive carry, then the position is essentially free.

But otherwise, most people just do perps for directional exposure—they don't want to carry. However, it could be useful for people that want to do more complex on-chain strategies.

---

### PerpDEX Innovation: Self-Repaying Funding Rates

**Akilesh:**

If you look at every single perp DEX—look at what Hyperliquid and others are doing with their fundraising—most perpetual rates on non-stablecoin assets, they don't want to pay the funding. They don't want to hurt their returns with multilateral-type things.

But if you were to do that, maybe—you mentioned the shorts market usually going one way on meme coins—it'd be interesting to have a perp DEX where there's this notion of the positive carry of the collateral indicating the funding rate. Whether you're long or short and you're putting up some model, the value of the positive-carry collateral matters.

One of the worst things about perps is you don't want to really have volatile funding rates decay against your collateral and get liquidated. But if you have self-repaying positive-carry collateral, the market dynamics get distorted—now if you margin one asset versus the other, interesting things happen.

It's similar to Alchemix in that sense—the underlying has positive carry (some sort of RWA), and the perp has a funding rate, and the underlying payout can offset what you have to pay.

Because at the end of the day, it's just a spot plus a borrow/lend platform. If you're superposing both of those together—instead of taking a canonical spot DEX and tacking on stables-only funding rate mechanics—you get a perp DEX plus Alchemix-type mechanic for self-repaying funding rates.

**Wally:**

Do you think people would want that?

**Akilesh:**

I'm trying to think about this. A lot of people complain about three things: one, they don't want to pay the funding; two, they don't want to predict funding; three, they don't like when the funding decays against their collateral in a volatile way, because then liquidation risk creeps in.

So I'm working backwards from those three annoyances: could we have autonomous payback by proxy, like the collateral?

---

### Where Intelligence Layer Could Be Most Helpful

**Akilesh:**

Where do you think the intelligence layer could be most helpful? There's this aspect of better curation, searching, and matching. There's the "go balls to the wall on better modeling" aspect. And there's maybe a separate third bucket. What do you guys think?

**Wally:**

I think my personal inclination is two aspects. First, there's the whole private computation stuff that I know we're cooking—enabling privacy is going to be very important. Regulatory-wise, right now everything is just public. Having the capability to have stuff that's actually encrypted is going to be a beta unlock.

The second thing is about automation. It's all cool to have AI agents and stuff, but really, if we can truly say that these protocols are being bottlenecked because they're trying to make their TVL more productive—that's the whole reason people want restaking and everything—but at the end of the day within RWA, you can't do much if you just don't have enough loans.

The bottleneck is not being able to automate quickly enough. We're an AI chain, but a lot of our primitives really just make it so that things can be automated. You don't have to worry about keepers. All the data is verified. All the analytics can be on-chain. You can leverage models that these people are already doing—XGBoost stuff for credit checks. Some of the partners we talked to are already doing this type of stuff.

---

### Private Credit Market Dynamics

**Akilesh:**

Private credit isn't going anywhere—it's here to stay. It really accelerated in 2020-2021 when Apollo started pushing private credit to institutional investors.

If you look at the broader private credit space—KKR, Apollo, Oaktree, Golub—those credit funds have absorbed 50x more capital over the last six years. You might have seen random outreach saying, "We can offer you bridge financing at some percent interest rate." The rates don't always make sense.

But it's still 15% if you can get your dollar in the door. It's an access game for higher quality credit. It'll be interesting to see how to democratize that. People on this call might want to put $1,000 into it—except Apollo doesn't want your thousand dollars. They've been oversubscribed for a while, and retail investors don't want ten-year lockups.

---

### Real Estate and Multi-Modal AI

**Akilesh:**

Wally, if you want to maybe do a separate discussion on the Parcls of the world—there's something very unique about that. I guess it's one of these markets where it's very clear that an LLM could add value through the multi-modality stuff, when you're thinking about scaling real estate at large.

I know all the existing real estate platforms suck in terms of their meta-analytics or kind of their curation—because they're just using legacy models that don't make any sense. Of course, we have to work backwards from what these companies are struggling with. So that's another Ritual-type thing.

I'd ideally just want to have a tranche of companies like this where we're chatting with them every few days to try to ideate easy pain points that the Ritual platform can just plug into. Even if none of it has to do with smart contracts—I don't really care about that because we have the network calls and the ability to orchestrate common Web2 subject platforms.

I think there's a lot of upside aside from begging other users to use their latest perps or prediction market or something, which is a competitive design space to say the least.

---

## Key Takeaways

1. **RWA market has matured** from speculative under-collateralized lending to properly collateralized, institutional-grade products
2. **BlackRock's BUIDL** was the inflection point for institutional adoption
3. **Multi-chain infrastructure** is solidifying with Ethereum as settlement layer, L2s handling specialized functions
4. **AI/intelligence layer is underpenetrated**—significant opportunity for Ritual
5. **Novel primitives emerging**: Self-repaying loans, future cash flow collateralization, automated insurance payouts
6. **Verification of off-chain events** is a recurring need across multiple protocol types

---

*Document prepared from internal strategy meeting transcript. For internal use only.*
