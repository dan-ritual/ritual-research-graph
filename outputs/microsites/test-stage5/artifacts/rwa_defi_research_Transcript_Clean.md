# RWA + DeFi '26 Overview Meeting

**Date:** January 15  
**Participants:** Emperor, Qt, Hans, Jody Rebak, Wally, Niraj Pant, Junyi, Akilesh Potti, Arshan, Bperszyk, Wooglin, Kartik

## Market Overview and Evolution

**Wally:** Tokenized assets exceed $35 billion. Before we get into what we think are the reasons for that, I think it's worth talking about how things have evolved since DeFi Summer in 2021. 

In 2021, we started out with things like Compound and Aave where the main experiment was about bringing assets collateralized with over-collateralized lending. It was really more about letting consumers borrow against their collateral. There was definitely a movement towards being able to have riskier assets or more long-tail assets enabled. Things like Cream Finance came out, and there were obviously other protocols that went in that direction.

As a lot of you know, there were a lot of risk events that caused the whole industry to evolve in the sense that they first started to look into having risk controls integrated with these protocols. They started to curtail a lot and come up with ways to try to manage this type of risk - things like Morpho and Euler that try to compartmentalize individual assets.

This sort of coincides with how RWAs are evolving. Early RWAs - one of the earlier players was Maple Finance. They wanted to do under-collateralized lending for folks, and they were on the riskier side of things. There was definitely still a push to go towards that, but I think the industry just wasn't mature enough or there wasn't enough infrastructure to really be able to do that properly. The industry didn't really have the proper tooling to price that risk, and there wasn't really enough analytics to allow something like Maple at that time to scale properly.

Maple had risk events where a bunch of players defaulted, and they promptly moved towards a shift towards more asset-backed collateral where it's no longer under-collateralized but actually collateralized.

## Key Drivers of Growth

**Wally:** The two main things that we think sparked this change are macro regulatory tailwinds that really enabled and sparked the interest, and products that allow people to gain better yield. That really got accelerated by institutional adoption.

Now we're entering this phase where, now that there's institutional adoption, there's going to be opportunity for people to expand on that and provide more crypto-native DeFi primitives on top of it.

### Macro Regulatory Tailwinds

The Fed normalized the risk-free rate to roughly 4-5% last year. That immediately created an opportunity for people that have money in savings accounts - you were probably getting 1-2% in your savings account. There was now an easy way, a very low-risk way, to get 4-5% yields by using treasuries. By simply tokenizing those treasuries, people that had a lot of on-chain assets could basically get exposure to this yield in a relatively risk-free way.

On the regulatory side, there's definitely more pro-crypto initiatives that were happening this year. One of them is obviously the pro-crypto administration and various acts. Among the reports that we saw, this was definitely one of the key events driving institutional adoption.

### Institutional Adoption

One of the biggest adopters on the institutional side was definitely BlackRock with their BUIDL fund. You can think of BlackRock and Ondo Finance as going hand in hand - BlackRock issuing institutionalized assets and Ondo tokenizing them so that people on-chain can actually get exposure to them. This single event really kick-started the acceleration of RWAs last year.

## Current State and Opportunities

**Wally:** One of the things that a lot of folks feel is that RWAs, at least when they were initially conceived, were more focused on just bringing things on-chain. There was not much focus on making things composable. There was not much focus on assets that were originated on-chain. These mostly focused on off-chain stuff like treasuries and real estate, trying to just one-for-one bring it on-chain. There's not a lot of effort to really leverage the crypto-native features that are available.

But I think that is really changing right now. Junyi and I found a lot of really interesting use cases that we think are uniquely crypto-native.

## Multichain Infrastructure

**Wally:** In 2026, the stack for RWAs is now really multichain. It's clear that Ethereum is now trusted as institutional security and settlement - sort of king-made by BlackRock choosing them for settlements. But you have other L2s that also help institutional adoption here.

Provenance and Plume are two examples that are taking sort of opposite approaches to making RWAs more crypto-native. Provenance is focusing on making the stuff that's on-chain legal - they really care about KYC and compliance built into their chain. Plume is more focused on having a standard RWA stack, so you can think of it as just a standard for all RWAs rather than everyone creating their own. Plume is more focused on bringing RWAs into other DeFi primitives like RWA-specific borrow-lend platforms.

## AI Integration Opportunities

**Wally:** A lot of the protocols that are built today aren't really leveraging AI features on-chain. When we did research, only really a couple even mentioned that they have some sort of AI analytics built in, and most of it is off-chain and not transparent. Bid.io is the only other one that I saw that tried to do anything AI-related - they're basically an AI oracle for pricing risks related to RWA assets. But frankly, they're more of a specialization of what we can provide.

Most of the things that we saw were more focused on really just making things more compliant and having more interesting business use cases.

## Protocol Deep Dives

**Junyi:** Let me share some specific protocols that constantly came up during our research across chains. I think folks here can put on their thinking hats about how Ritual can actually be utilized across these protocols.

### Provenance Blockchain

**Junyi:** One of the big ones that I was surprised by in terms of TVL - this one is controversial - is Provenance. Provenance is a chain that's been around for quite some time, just not talked about much. It's actually the guys behind Figure Markets, SoFi folks.

If you go to the website, you can see some incredible numbers. If they claim to have $20 billion in TVL - obviously something Wally and I like to do is cross-check on-chain if this is real. There's some controversy because DeFi Llama was never able to prove this number. Figure Markets came out to say some of these things can't be proven on-chain because a large part of it - $15 billion - is basically home equity lines of credit that have been tokenized on-chain. So it's massive amounts of lines of credit that were traditionally not on-chain, but it's all been tokenized. And $600 million of the TVL is actually insurance.

Figure Markets is basically bringing in a bunch of different RWAs - line of credits for home equity, insurance. They just announced yesterday that they're going to allow people to borrow and lend using their tokenized stocks. So your traditional assets can be tokenized to borrow stuff.

They have this product called Prime that's basically allowing people and lenders to use collateral that's actually not just crypto, but also real assets like homes and houses.

The other big push by Provenance is the insurance side. In 2025, they only had $100 million tokenized in insurance, but right now they actually have $600 million in insurance tokenized on-chain. This was one of the categories in 2026 outlook reports we read through - basically allowing people to have automatic insurance payouts triggered by off-chain events such as hurricanes, natural fires, various kinds of natural disasters, or death of relatives, allowing auto payouts. The idea is also for policyholders to at some point trade these policies on secondary markets.

### Zivo Protocol

**Junyi:** You could think of Zivo as a form of synthetic credit derivatives where on-chain folks want to lend to real-world small businesses and consumer loans. There is some form of leverage here because what Zivo does is it actually tranches it into senior and junior tranches. This creates leverage for junior tranches, and that's essentially how they push up some of their yields.

As Wally mentioned, it's pretty new and tiny, but this was something that we found interesting. The reason why this protocol was highlighted is because it's one of the protocols that from a revenue-to-TVL basis performs relatively well compared to other RWA protocols out there. Between 1-3% annualized is what we saw across protocols. Zivo is on the higher end at around 3.6%. It's one of the newer ones, so it's less proven - it hasn't even been a year yet. But it's $1 million in revenue on roughly $6 million deposits, and 95% of those deposits are generally used all the time.

### Credit Coop

**Junyi:** The third one, which is really interesting, is called Credit Coop. While the earlier ones collateralize your line of credits for your homes and insurances, what Credit Coop does is allow businesses to collateralize their future cash flow.

Some businesses highlighted here include Rain - I'm not sure if anyone follows the crypto cards space, but some of you probably use them. Rain is one of the biggest infra providers for crypto cards. Your EtherFi cards are all powered by Rain.

Businesses like Rain can actually come on here to collateralize their future cash flow and then use that to borrow stablecoins from lenders. You can extend this idea to someone wanting to collateralize their salary and use that to borrow stablecoins.

The way they do it is they work with these businesses, get them KYC'd, have them prove their future cash flow, and then deploy smart contracts that have these businesses stream their cash flow from month one, month two, month three into smart contracts which then distribute to users who lend to them.

## Self-Repaying Mechanisms

**Wally:** One of the protocols called Zivo has this interesting revenue model where part of your actual sales goes to the repayment. So you create a really interesting structure where you only pay when you make money. As Junyi put it, this type of structure is sort of self-paying, almost similar to Alchemix for those that remember that protocol.

For things like this, one of the problems is you have a lot of idle capital the moment that your loans are fulfilled. You have potentially a lot of idle capital sitting in the protocol. So one of the things that we feel could be interesting is having AI scale that process to originate more loans so that the capital is less likely to sit there idle. Rather than have someone manually do a lot of the loan origination, you can have AI help scale that process and automate a lot of the things that are currently done manually.

## Q&A and Discussion

**Qt:** I thought the comparison to Alchemix from the Zivo side is pretty interesting. I personally think the self-repaying debt just makes a ton of sense structurally. Is Zivo kind of the only place you guys saw that, or was that primitive kind of in other credit markets?

**Wally:** The spigot mechanism that Junyi was mentioning - the whole idea is that rather than having an obligation to pay immediately or based on some time frame, it's based on your actual streaming revenue. For example, if you were a business and sold ice cream cones, a fraction of your sales would go into repaying the actual loan. Obviously, if you didn't make any money, you would not be paying the loan back. So in that sense, you only pay back the loan if you're making money.

**Junyi:** That mechanism is also being used by Credit Coop, which is a much larger protocol than Zivo. Zivo is focusing on consumer marketing, while Credit Coop is focusing on a different sector and also does real estate.

**Qt:** When you think about the Parcel market that turns into real estate exposure, a lot of people want to hedge. When you think about sourcing the locate for that hedge, the interest rate you pay for locates on the short side, but like positive carry collateral - so it's kind of like a duo, right? You can effectively maybe arbitrage between the positive carry that the platform gets on the asset that you're holding first versus what you have to pay on the short side.

**Wally:** You're basically saying if there is some sort of mechanism where I have positive carry assets that would pay off the actual fees required to hold the short position. I think we'd have to look into the exact mechanism or economics of something like Parcel.

## Future Applications and Opportunities

**Niraj:** Where do you think AI could be helpful? There's this point of better curating and matching, there's this notion of better risk modeling - what do you guys think?

**Wally:** My personal inclination is two aspects that I would be interested in. First, there's the whole privacy aspect - enabling private stuff on-chain is going to be very important regulatory-wise. Right now everything is just public, and I assume that might cause issues. So having the capability to have stuff that's actually encrypted is going to be a big unlock.

The other thing is about automation. These protocols are being bottlenecked because people are trying to make their assets and TVL more productive. But at the end of the day, within RWA, you can't do much if you just don't have enough loans. The bottleneck is not being able to automate quick enough. We could make it so that things can be automated - you don't have to worry about keepers, everything is verified, and all the analytics can be on-chain. You can leverage models that these people are already doing off-chain to do credit checks and all that stuff.

**Niraj:** I think including myself, a lot of people at Ritual have been a bit away from keeping track of RWA DeFi. I think it was good to do this brain dump on the current state of things. We should obviously have a follow-up meeting to talk about specific Ritual prototypes that people can launch or AI agents on these live protocols.

There's a lot of other value that we can provide as overlays to some of these folks, and maybe there's a very clear set of B2B type things just by reaching out and getting connected to the up-and-coming Zivos of the world.

**Niraj:** I don't think private credit is going anywhere. I think it's been a huge growth area. It really grew in 2020, mid-2021. But there is something weird looming in the private credit space. It's still a 15% return environment if you can get your dollar in the door, and it's an access game. Most of this is about access to higher quality credit.

It's going to be very interesting to see how to democratize that a bit. For example, if people on this call could put $1,000 into high-quality credit, except these funds don't want your thousand dollars - they're oversubscribed and have been for a while. And people don't want to hear about long lockups.

It's a very interesting, rich space. There's something very unique about companies like Parcel where it's very clear that an LLM could add value to the multi-modality stuff when you're thinking about scaling real estate at large. All the existing real estate platforms suck in terms of their analytics because they're using legacy models that just don't make sense.

I'd like to have a cohort of companies like this where we're just chatting with them every few days to try to ideate on pain points that the Ritual platform can plug into. Even if none of it has to do with smart contracts, I don't really care about that because we have the ability to orchestrate common Web2 platforms. I think there's a lot of upside aside from building other prediction markets or perps, which is a competitive design space to say the least.

**Wally:** Thanks everyone. Thanks Junyi and I know it's like 2 AM for you guys. Appreciate you all.