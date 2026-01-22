# RWA + DeFi '26 Overview Meeting

**Date:** January 15  
**Participants:** Emperor, Qt, Hans, Jody Rebak, Wally, Niraj Pant, Junyi, Akilesh Potti, Arshan, Bperszyk, Wooglin, Kartik

## Market Overview and Evolution

**Wally:** Tokenized assets exceed $35 billion. Before we get into what we think are the reasons for that, I think it's worth talking about how things have evolved since DeFi summer in 2021. A lot of us have been through that, but for those that don't remember, in 2021 it started out with things like Compound and Aave where the main experiment was about bringing assets collateralized with overcollateralized lending. It was more about letting consumers borrow against their collateral.

There was definitely a movement towards being able to have riskier assets or more long tail assets enabled. Things like Cream Finance came out, and there were obviously other protocols that went in that direction. As a lot of you know, there were a lot of risk events that caused the whole industry to evolve in the sense that they first started to look into having risk controls integrated with these protocols. They started to curtail a lot and come up with ways to try to manage this type of risk - things like Morpho and Euler that try to compartmentalize individual assets.

This coincides with how RWAs are evolving. Early RWAs - one of the earlier players was Maple Finance. Basically, they wanted to do undercollateralized lending for folks, and they were on the riskier side of things. There was definitely still a push to go towards that, but I think the industry just wasn't mature enough or there wasn't enough infrastructure to really be able to do that properly. The industry didn't really have the proper tooling to price that risk, and there wasn't really enough analytics to allow something like Maple at that time to scale properly.

Maple had risk events where a bunch of players defaulted, and they promptly moved towards a shift towards more asset-backed collateral where it's no longer undercollateralized but actually collateralized.

## Key Market Drivers

**Wally:** The two main things that we think sparked this change are macro regulatory tailwinds that really enabled and sparked the interest, and products that allow people to gain better yield. That really got accelerated by institutional adoption. Now we're entering this phase where, now that there's institutional adoption, there's going to be opportunity for people to expand on that and provide more crypto-native DeFi primitives on top of it.

### Macro Regulatory Tailwinds

The first point is macro regulatory tailwinds. Everyone remembers when the Fed normalized the risk-free rate to roughly 4-5% last year. That immediately created an opportunity for people that have money in savings accounts - most people remember you were probably getting 1-2% in your savings account. There was now an easy way, a very low-risk way, to get 4-5% yields by using treasuries. By simply tokenizing those treasuries, people that had a lot of on-chain assets could basically get exposure to this yield in a relatively risk-free way. On the macro side, that's one of the big things that happened - one of the initial demands for RWAs, which was basically tokenized treasuries.

On the regulatory side, there's definitely more pro-crypto initiatives that were happening this year. One of them is obviously the pro-crypto administration and various acts. Among the reports that we saw, this was definitely one of the key events driving institutional adoption.

### Institutional Adoption

One of the biggest adopters on the institutional side was definitely BlackRock with their BUIDL fund. You can think of BlackRock and Ondo Finance - BlackRock is issuing institutionalized assets, and Ondo Finance is tokenizing them so that people on-chain can actually get exposure to them. This single event really kick-started the acceleration of RWAs last year.

## Current State and Opportunities

**Wally:** One of the things that a lot of folks feel is that RWAs, at least when they were initially conceived, were more focused on just bringing things on-chain. There was not much focus on making things composable. There was not much focus on assets that were originated on-chain. These mostly focused on off-chain stuff like treasuries and real estate, trying to just one-for-one bring it on-chain. There's not a lot of effort to really leverage the crypto-native features that are available. But I think that is really changing right now. Junyi and I found a lot of really interesting use cases that we think are uniquely crypto-native.

### Multichain Infrastructure

In 2026, the stack for RWAs is now really multichain. It's clear that Ethereum is now trusted as institutional security and settlement - sort of king-made by BlackRock choosing them for settlements. But you have other L2s that also help institutional adoption here. Provenance and Plume are two examples that are highlighted.

Provenance and Plume are taking opposite approaches to making RWAs more crypto-native. Provenance is focusing on making the stuff that's on-chain legal - they really care about KYC and compliance built into their chain. Plume is more focused on having a standard RWA stack, so you can think of it as just a standard for all RWAs rather than everyone creating their own. Plume is more focused on bringing RWAs into other DeFi primitives like RWA-specific borrow-lend platforms.

## AI Integration Opportunities

**Wally:** Among the things that we think are interesting - even today, a lot of the protocols that are built aren't really leveraging AI features on-chain. When we did research, only a couple even mentioned that they have some sort of AI analytics built in, and most of it is off-chain and not transparent. Bid.io is the only other one that I saw that tried to do anything AI-related - they're an AI oracle for pricing risks related to RWA assets. But frankly, they're more of a specialization of what we can provide.

Most of the things that we saw were more focused on making things more compliant and having more interesting business use cases. We think that as they become more complex, one of the problems we saw was idle capital. For example, one of the protocols called Zivo connects loans and liquidity in merchant cash advance markets. You can think of merchant cash advance markets as - if you're a retail shop that wants to borrow money, rather than repaying on a time commitment, a portion of your actual sales goes to the repayment. This creates a really interesting structure where you only pay when you make money.

This type of structure is self-paying, almost similar to Alchemix for those that remember that protocol. For things like this, one of the problems is you have a lot of idle capital the moment your loans are fulfilled. One of the things that we feel could be interesting is having AI scale that process to originate more loans so that the capital is less likely to sit there idle. Rather than have someone manually do a lot of the loan origination, you can have AI help scale that process and automate a lot of the things that are currently done manually.

## Protocol Deep Dives

**Junyi:** Let me share some specific protocols that constantly came up during our research across chains. I think one of the big ones that I was surprised by in terms of TVL - this one is controversial - is Provenance. Provenance is a chain that's been around for quite some time, it's just not been talked about much. It's actually the guys behind Figure Markets, SoFi folks.

### Provenance Blockchain

If you go to their website, you can see some incredible numbers. They claim to have $20 billion in TVL. There's some controversy because DeFi Llama was never able to prove this number on-chain because a large part of it - $15 billion - is basically home equity lines of credit that have been tokenized on-chain. It's massive amounts of lines of credit that were traditionally not on-chain, but it's all been tokenized. $600 million of the TVL is actually insurance.

Figure Markets is basically bringing in a bunch of different RWAs - line of credits for home equity, insurance. They just announced yesterday that they're going to allow people to borrow and lend using their tokenized stocks. Your traditional assets can be tokenized to borrow stuff.

They have this product called Prime that's basically allowing lenders to use collateral that's not just crypto but also real assets like homes and houses. The other big push by Provenance is the insurance side of things. In 2025, they only had $100 million tokenized in insurance, but right now they have $600 million in insurance tokenized on-chain. This allows people to have automatic insurance payouts triggered by off-chain events such as hurricanes, natural fires, various kinds of natural disasters, or death of relatives, allowing auto payouts. The idea is also for policyholders to trade the policies on secondary markets.

### Zivo Protocol

You could think of Zivo as a form of synthetic credit derivatives where on-chain folks want to lend to real-world small businesses and consumer loans. There's some form of leverage here because Zivo crunches it into senior and junior tranches, which creates leverage for junior tranches. That's essentially how they push up some of their yields. It's pretty new but something we found interesting.

### Credit Co-op

The third one, which is really interesting, is called Credit Co-op. While the earlier ones collateralize your line of credits for your homes and insurances, Credit Co-op allows businesses to collateralize their future cash flow. Some businesses highlighted here include Rain, which powers a lot of crypto cards. Rain is one of the biggest infrastructure providers for crypto cards - your EtherFi cards are all powered by Rain.

Businesses like Rain can come on here to collateralize their future cash flow and then use that to borrow stablecoins from lenders. You can extend this idea to someone wanting to collateralize their salary and use that to borrow stablecoins. The way they do it is they work with these businesses, get them KYC'd, have them post their future cash flow, and then deploy smart contracts that have these businesses stream this cash flow from month one, month two, month three into smart contracts which then distribute to users who lend to them.

## Discussion and Q&A

**Hans:** I thought the comparison to Alchemix from the last cycle is pretty interesting on the Zivo side. I personally think the self-repaying debt just makes a ton of sense structurally. Is Zivo kind of the only place you guys saw that, or was that primitive kind of in other credit markets?

**Wally:** Junyi found Credit Co-op, which is conceptually similar in the sense that the spigot mechanism - rather than paying based on some time frame, it's based on your streaming revenue. If you were a business that sold ice cream cones, a fraction of your sales would go into repaying the actual loan. If you didn't make any money, you would not be paying the loan back. You only pay back the loan if you're making money.

**Junyi:** Credit Co-op is focusing on a different sector and is much larger than Zivo. Rain powers EtherFi, which a lot of you have heard about. EtherFi makes money on transaction fees, and you can imagine a business like Rain where they are acting as a service provider - there's the ability to make loans against that income stream.

**Hans:** When you think about the Parcel market that turns into real estate exposure, a lot of people want to hedge. When you think about sourcing the locate for that hedge, the interest rate you pay for locates on the short side could be offset by positive carry collateral. You can effectively maybe arbitrage between the positive carry that the platform gets on the asset that you're long versus what you have to pay on the short side.

**Wally:** I think we'd have to look into the exact mechanism and economics of something like Parcel. It's been around since 2023.

**Hans:** Most people do perpetuals to actually generate yield, and if they have the spot and the spot is generating positive carry, then the position is essentially free. It could be useful for people that want to do more complex on-chain strategies.

## Ritual Integration Opportunities

**Hans:** Where do you think AI could be helpful? There's this point of better curating, searching, and matching. There's this notion of better risk modeling. What do you guys think?

**Wally:** My personal inclination is two aspects. First, there's the privacy aspect - being able to put private stuff on-chain is going to be very important regulatory-wise. Right now everything is public, which might cause issues. Having the capability to have stuff that's actually encrypted is going to be a big unlock.

The other thing is about protocols being bottlenecked. People are trying to make their assets and TVL more productive, but at the end of the day, within RWA, you can't do much if you just don't have enough loans. The bottleneck is not being able to automate quickly enough. We're an AI chain, and a lot of our primitives really just make it so that things can be automated. You don't have to worry about keepers, everything is verified, and all the analytics can be on-chain. You can leverage models that these people are already doing off-chain for credit checks.

**Niraj:** I think including myself, a lot of people at Ritual have been a bit away from keeping track of RWA DeFi. It was good to do this brain dump on the current state of things. We should have a follow-up meeting to talk about specific Ritual prototypes that people can launch or AI agents on these platforms.

There's a lot of other value that we can provide as overlays to these folks, and maybe there's a very clear set of B2B type things just by reaching out and getting connected to the up-and-coming Zivos of the world. I don't think private credit is going anywhere - it's been growing quite a bit since mid-2021.

**Niraj:** Until we start to see more of a bubble there - and it is a bubble in the broader private credit space - if you look at how much assets under management firms like Apollo and KKR have, those credit funds have grown like 50x over the last six years. It's an access game in terms of higher quality credit. It's going to be very interesting to see how to democratize that a bit.

There's something very unique about companies like Parcel where it's very clear that an LLM could add value to the multi-modality stuff when you're thinking about scaling real estate at large. All the existing real estate platforms suck in terms of their analytics because they're using legacy models that don't make sense.

I'd like to have a tranche of companies like this where we're chatting with them every few days to ideate on pain points that the Ritual platform can plug into, even if none of it has to do with smart contracts. We have the ability to orchestrate common Web2 platforms as well.

**Wally:** Thanks everyone. Thanks Junyi and I know it's 2 AM for you guys. Appreciate you all.