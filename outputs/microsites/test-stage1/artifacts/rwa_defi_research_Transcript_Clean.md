# RWA + DeFi '26 Overview Meeting

**Date:** January 15  
**Participants:** Emperor, Qt, Hans, Jody Rebak, Wally, Niraj Pant, Junyi, Akilesh Potti, Arshan, Bperszyk, Wooglin, Kartik

## Market Overview and Evolution

**Wally:** Tokenized assets exceed $35 billion. Before we get into what we think are the reasons for that, I think it's worth talking about how things have evolved since DeFi summer in 2021. 

In 2021, we started out with things like Compound and Aave where the main experiment was about bringing rates of experimentation - really having assets collateralized with over-collateralized lending. It was more about letting consumers borrow against their collateral. There was definitely a movement towards being able to have riskier assets or more long-tail assets enabled. Things like Cream Finance came out, and there were obviously other protocols that went in that direction.

As a lot of you know, there were a lot of risk events that caused the whole industry to evolve in the sense that they first started to look into having risk controls integrated with these protocols. They started to curtail a lot and come up with ways to try to manage this type of risk - things like Morpho and Euler that try to compartmentalize individual assets.

This coincides with how RWAs are evolving. Early RWAs - one of the earlier players was Maple Finance. They wanted to do under-collateralized lending for folks, and they were on the riskier side of things. There was definitely still a push to go towards that, but I think the industry just wasn't mature enough or there wasn't enough infrastructure to really be able to do that properly. The industry didn't really have the proper tooling to price that risk, and there wasn't really enough analytics to allow something like Maple at that time to scale properly.

Maple had risk events where a bunch of players defaulted, and they promptly moved towards a shift towards more asset-backed collateral where it's no longer under-collateralized - it's actually collateralized.

## Key Market Drivers

**Wally:** The two main things that we think sparked this change are macro regulatory tailwinds that really enabled and sparked the interest, and products that allow people to gain better yield. That really got accelerated by institutional adoption.

Now we're entering this phase where, now that there's institutional adoption, there's going to be opportunity for people to expand on that and provide more crypto-native DeFi primitives on top of it.

### Macro Regulatory Tailwinds

The first point is macro regulatory tailwinds. Everyone remembers when the Fed normalized the risk-free rate to roughly 4-5% last year. That immediately created - for people that have some money in savings accounts, you were probably getting 1-2% in your savings account. There was now an easy way, a very low-risk way, to get 4-5% yields by using treasuries. By simply tokenizing those treasuries, people that had a lot of on-chain assets could basically get exposure to this yield in a relatively risk-free way.

On the regulatory side, there's definitely more pro-crypto initiatives that were happening this year. One of them is obviously the pro-crypto administration and various acts. Among the reports that we saw, this was definitely one of the key events driving institutional adoption.

### Institutional Adoption

One of the biggest adopters on the institutional side was definitely BlackRock with their BUIDL fund. You can think of BlackRock and Ondo Finance - BlackRock is issuing institutionalized assets, and Ondo Finance is tokenizing them so that people on-chain can actually get exposure to them. This single event really kick-started the acceleration of RWAs last year.

## Current State and Opportunities

**Wally:** One of the things that a lot of folks feel is that RWAs, at least when they were initially conceived, were more focused on just bringing things on-chain. There was not much focus on making things composable. There was not much focus on assets that were originated on-chain. These mostly focused on off-chain stuff like treasuries and real estate, trying to just one-for-one bring it on-chain. There's not a lot of effort to really leverage the crypto-native features that are available. But I think that is really changing right now.

### Multi-Chain Infrastructure

In 2026, the stack for RWAs is now really multi-chain. It's clear that Ethereum is now trusted as institutional security and settlement layer - sort of king-made by BlackRock choosing them for settlements. But you have other L2s that also help the institutional adoption here.

Provenance and Plume are two examples that are taking sort of opposite approaches to making RWAs more crypto-native. Provenance is focusing on just making the stuff that's on-chain legal - they really care about KYC and compliance built into their chain. Plume is more focused on having a standard RWA stack, so you can think of it as just a standard for all RWAs rather than everyone creating their own. Plume is more focused on bringing RWAs into other DeFi primitives like RWA-specific borrow-lend platforms.

### AI Integration Opportunities

Among the things that we think are interesting - even today, a lot of the protocols that are built aren't really leveraging AI features on-chain. When we did research, only really a couple even mentioned that they have some sort of AI analytics built in, and most of it is off-chain and not transparent.

Bid.io is the only other one that I saw that tried to do anything AI-related - they're an AI oracle for pricing risks related to RWA assets. But frankly, they're more of a specialization of what obviously we can provide.

## Protocol Deep Dives

**Junyi:** Let me share some specific protocols that constantly came up during our research across chains. Folks here can put on their thinking hats about how Ritual can actually be utilized across these protocols.

### Provenance Blockchain

One of the big ones that I was surprised by in terms of TVL - this one is controversial - is Provenance. Provenance is a chain that's been around for quite some time but hasn't been talked about much. It's actually the guys behind Figure Markets, SoFi folks.

If you go to the website, you can see some incredible numbers. They claim to have $20 billion in TVL. There's some controversy because DeFi Llama was never able to prove this number on-chain because a large part of it - $15 billion - is basically home equity lines of credit that have been tokenized on-chain. It's massive amounts of lines of credit that were traditionally not on-chain, but it's all been tokenized. $600 million of the TVL is actually insurance.

Figure Markets is basically bringing in a bunch of different RWAs - line of credits for home equity, insurance. They just announced yesterday that they're going to allow people to borrow and lend using their tokenized stocks.

They have this product called Prime that's basically allowing lenders to use collateral that's not just crypto but also real assets like homes and houses. The other big push by Provenance is the insurance side. In 2025, they only had $100 million tokenized in insurance, but right now they have $600 million in insurance tokenized on-chain.

This opens up automatic insurance payouts triggered by off-chain events such as hurricanes, natural fires, various kinds of natural disasters, or even death of relatives - allowing auto payouts. The idea is also for policyholders to trade these policies on secondary markets.

### Zivo Protocol

The second protocol is Zivo. You could think of it as a form of synthetic credit derivatives where on-chain folks want to lend to real-world small businesses and consumer loans. There's some form of leverage here because Zivo crunches it into senior and junior tranches, which creates leverage for junior tranches.

As Wally mentioned, it's pretty new but something we found interesting. This type of structure is sort of self-paying, almost similar to Alchemix for those that remember that protocol. Rather than having an obligation to pay immediately or based on some time frame, it's based on your streaming revenue. For example, if you were a business that sold ice cream cones, a fraction of your sales would go into repaying the actual loan. If you didn't make any money, you would not be paying the loan back. You only pay back the loan if you're making money.

### Credit Coop

The third one is Credit Coop. What Credit Coop does is allow businesses to collateralize their future cash flow. Some businesses highlighted here include Rain, which powers a lot of the crypto cards out there - the biggest infrastructure for crypto cards like EtherFi cards.

Businesses like Rain can come on here to collateralize their future cash flow and then use that to borrow stablecoins from lenders. You can extend this idea to someone wanting to collateralize their salary and use that to borrow stablecoins.

The way they do it is they work with these businesses, get them KYC'd, have them prove their future cash flow, and then deploy smart contracts that have these businesses stream their cash flow from month one, month two, month three into smart contracts which then distribute to users who lend to them.

## Market Analysis and Competitive Landscape

**Wally:** We also ran some numbers to see what type of profitability we were seeing. Between 1-3% annualized is what we saw across protocols. Zivo is on the higher end at around 3.6%, which is why we chose to highlight it, but it's also one of the newer ones so it's less proven. It hasn't even been a year yet, but it's doing $1 million in revenue on roughly $6 million deposits, with 95% of those deposits generally used all the time.

### Incumbent Players

Maple, as I mentioned earlier, is one of the older players that started out with under-collateralized loans but now have pivoted to asset-backed secured lending. They've done fairly well last year.

Clearpool is another player in the space. The main one that people haven't heard about is Zivo, which is going with this interesting model where part of your revenue stream is basically used to pay back your loan.

## Discussion and Q&A

### Self-Paying Debt Mechanisms

**Qt:** I thought the comparison to Alchemix was pretty interesting on the Zivo side. I personally think the self-paying debt just makes a ton of sense structurally. Is Zivo kind of the only place you guys saw that, or was that primitive kind of in other credit markets?

**Wally:** The spigot mechanism is conceptually similar. The whole idea is that rather than paying based on some time frame, it's based on your streaming revenue. This mechanism is also being used by Credit Coop, which is a much larger protocol than Zivo. Zivo is focusing on consumer marketing, while Credit Coop is focusing on a different sector.

**Junyi:** Credit Coop powers a lot of the crypto cards out there. The biggest example is Rain, which powers EtherFi cards. You can imagine a business like Rain where they are acting as a service provider, and for folks that use something like EtherFi, there is the ability to make loans. Rather than paying directly with stablecoins, Rain as a service provider can make money off of that, and you can imagine that income stream going into being paid out to whoever is lending the money.

### Integration Challenges and Opportunities

**Wally:** Not all these protocols require some form of KYC because it's RWAs. That's definitely one of the things we're seeing as part of the institutionalization. A lot of these are basically building in KYC at the chain level.

From my personal inclination, there are two aspects I'd be interested in. First, there's the whole privacy aspect - enabling private stuff on-chain is going to be very important regulatory-wise. Right now everything is just public, which might cause issues. Having the capability to have stuff that's actually encrypted is going to be a big unlock.

The other thing is about automation. These protocols are being bottlenecked because people are trying to make their assets and TVL more productive. But at the end of the day, within RWAs, you can't do much if you just don't have enough loans. The bottleneck is not being able to automate quick enough. We could make it so that things can be automated - you don't have to worry about keepers, everything is verified, and all the analytics can be on-chain.

### Market Outlook

**Qt:** I don't think private credit is going anywhere. I think it's here to stay for quite a bit. It really grew in 2020, mid-2021. Until we actually start to see more of a bubble there - and it is a bubble - if you look at how much new capital private credit funds have soaked up, it's like 50x over the last six years.

There is something weird looming in the private credit space that's been there for a while. It's going to be very interesting to see how to democratize that a bit. For example, if people on this call could put $1,000 into high-quality credit - except these funds don't want your thousand dollars because they're oversubscribed and have been for a while.

It's a very interesting, rich space. There's something very unique about markets where it's very clear that an LLM could add value to the multi-modality stuff, especially when thinking about scaling real estate at large. All the existing real estate platforms suck in terms of their analytics because they're using legacy models that just don't make any sense.

## Next Steps

**Qt:** We should obviously have a follow-up meeting to maybe talk about specific Ritual prototypes that people can launch or AI agents on these platforms. That'd be kind of fun to make it interactive and try to make it very clear on how to build these overnight type solutions.

I think there's a lot of other value that overlays can provide to some of these folks, and maybe there's a very clear set of B2B type things just by reaching out and getting connected to the up-and-coming Zivos of the world.

**Meeting concluded with thanks to all participants**