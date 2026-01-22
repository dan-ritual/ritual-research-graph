# RWA + DeFi '26 Overview Meeting

**Date:** January 15  
**Participants:** Emperor, Qt, Hans, Jody Rebak, Wally, Niraj Pant, Junyi, Akilesh Potti, Arshan, Bperszyk, Wooglin, Kartik

## Market Overview and Evolution

**Wally:** Tokenized assets exceed $35 billion. Before we get into what we think are the reasons for that, I think it's worth talking about how things have evolved since DeFi summer in 2021. 

In 2021, we started out with things like Compound and Aave, where the main experiment was about bringing rates of experimentation with assets collateralized with overcollateralized lending. It was more about letting consumers borrow against their collateral. There was definitely a movement towards being able to have riskier assets or more long tail assets enabled. Things like Cream Finance came out, and there were obviously other protocols that went in that direction.

As a lot of you know, there were a lot of events that caused risk events that caused the whole industry to evolve. They first started to look into having risk controls integrated with these protocols and started to curtail a lot and come up with ways to try to manage this type of risk. Things like Morpho and Euler tried to compartmentalize individual assets.

This coincides with how RWAs are evolving. Early RWAs - one of the earlier players was Maple Finance. They wanted to do undercollateralized lending for folks, and they were on the riskier side of things. But I think the industry just wasn't mature enough or there wasn't enough infrastructure to really be able to do that properly. The industry didn't really have the proper tooling to price that risk, and there wasn't really enough analytics to allow something like Maple at that time to scale properly.

Maple had risk events where a bunch of players defaulted, and they promptly moved towards a shift towards more asset-backed collateral where it's no longer undercollateralized but actually collateralized.

## Key Market Drivers

**Wally:** The two main things that we think sparked this change are macro regulatory tailwinds that really enabled and sparked the interest, and products that allow people to gain better yield. That really got accelerated by institutional adoption.

Now we're entering this phase where, now that there's institutional adoption, there's going to be opportunity for people to expand on that and provide more crypto-native DeFi primitives on top of it.

### Macro Regulatory Tailwinds

The Fed normalized the risk-free rate to roughly 4-5% last year. That immediately created an opportunity for people that have money in savings accounts - you were probably getting 1-2% in your savings account. There was now an easy way, a very low-risk way, to get 4-5% yields by using treasuries. By simply tokenizing those treasuries, people that had a lot of on-chain assets could get exposure to this yield in a relatively risk-free way. That was one of the big things that happened - one of the initial demands for RWAs, which was basically tokenized treasuries.

On the regulatory side, there's definitely more pro-crypto initiatives that were happening this year. Obviously the pro-crypto administration and the FIT21 Act. Among the reports that we saw, this was definitely one of the key events driving institutional adoption.

### Institutional Adoption

One of the biggest adopters on the institutional side was definitely BlackRock with their BUIDL fund. You can think of BlackRock and Ondo Finance as going hand in hand. Ondo Finance is the provider that is tokenizing - you can think of it as BlackRock issuing institutionalized assets and Ondo tokenizing them so that people on chain can actually get exposure to them. This single event really kick-started the acceleration of RWAs last year.

## Current State and Limitations

**Wally:** One of the things that a lot of folks feel is that RWAs, at least when they were initially conceived, were more focused on just bringing things on chain. There was not much focus on making things composable. There was not much focus on assets that were originated on chain. These mostly focused on off-chain stuff like treasuries and real estate, trying to just one-for-one bring it on chain. There's not a lot of effort to really leverage the crypto-native features that are available. But I think that is really changing right now.

## Multichain Infrastructure

**Wally:** In 2026, the stack for RWAs is now really multichain. It's clear that Ethereum is now trusted as institutional security and settlement layer - sort of king-made by BlackRock choosing them for settlements. But you have other L2s that also help the institutional adoption here.

Provenance and Plume are two examples that are taking sort of opposite approaches to making RWAs more crypto-native. Provenance is focusing on just making the stuff that's on-chain legal - they really care about KYC and compliance built into their chain. Plume is more focused on having a standard RWA stack, so you can think of it as just a standard for all RWAs rather than everyone creating their own. Plume is more focused on bringing RWAs into other DeFi primitives like RWA-specific borrow-lend platforms.

## AI Integration Opportunities

**Wally:** A lot of the protocols that are built today aren't really leveraging AI features on-chain. When we did research, only a couple even mentioned that they have some sort of AI analytics built in, and most of it is off-chain and not transparent. Bid.io is the only other one that I saw that tried to do anything AI-related - they're an AI oracle for pricing risks related to RWA assets. But frankly, they're more of a specialization of what we can provide.

Most of the things that we saw were more focused on really just making things more compliant and having more interesting business use cases.

## Protocol Deep Dives

### Zivo Protocol Example

**Wally:** As RWAs become more complex, one of the problems we saw - for example, one of the protocols called Zivo, which is an RWA protocol that connects loans and liquidity to merchant cash advances and markets. You can think of merchant cash advances as something where you're a retail shop that wants to borrow money, but rather than repaying on a time commitment, a portion of your actual sales goes to the repayment.

This creates a really interesting structure where you only pay when you make money. As Juni put it, this type of structure is sort of self-paying, almost similar to Alchemix for those that remember that protocol.

For things like this, one of the problems is you have a lot of idle capital the moment that your loans are fulfilled. One of the things that we feel could be interesting is having AI scale that process to originate more loans so that the capital is less likely to sit there idle. Rather than have someone manually do a lot of the loan origination, you can have AI to help scale that process and automate a lot of the things that are currently done manually.

### Incumbent Analysis

**Wally:** Maple, as I mentioned earlier, is one of the older players that started out with undercollateralized loans but now have really pivoted to asset-backed secured lending. They've done fairly well last year. Clearpool is also another player. The main one that people haven't heard about is Zivo, which is going with this interesting model where part of your revenue stream is basically used to pay back your loan.

The reason why this protocol in particular was highlighted is because it's one of the protocols that from a revenue-to-TVL basis is relative to the other RWA protocols out there. We ran some numbers to see what type of profitability we were seeing - between 1-3% annualized is what we saw. Zivo is on the higher end at around 3.6%. It's one of the newer ones, so it's less proven - it hasn't even been a year yet. But it's $1 million in revenue on roughly $6 million deposits, and 95% of those deposits are generally used all the time.

## Specific Protocol Analysis

### Provenance Blockchain

**Junyi:** Provenance is a chain that's been around for quite some time but just hasn't been talked about much. It's actually the guys behind Figure Markets, SoFi folks. If you go to the website, you can see some incredible numbers. They claim to have $20 billion in TVL. There's some controversy because DeFi Llama was never able to prove this number on-chain because a large part of it - $15 billion - is basically home equity lines of credit that have been tokenized on-chain. So it's massive amounts of lines of credit that were traditionally not on-chain, but it's all been tokenized. And $600 million of the TVL is actually insurance.

Figure Markets is basically bringing in a bunch of different RWAs - lines of credit for home equity, insurance. They just announced yesterday that they're going to allow people to borrow and lend using their tokenized stocks. So your traditional assets can be tokenized to borrow stuff.

They have this product called Prime that's basically allowing people, lenders, to use collateral that's actually not just crypto but also real assets like homes and houses. The other big push by Provenance is the insurance side of things. They had $100 million tokenized in insurance in 2025, but right now they actually have $600 million in insurance tokenized on-chain.

This was one of the categories in 2026 outlook reports - basically allowing people to have automatic insurance payouts triggered by off-chain events such as hurricanes, natural fires, various kinds of natural disasters, or death of relatives, allowing auto payouts. The idea is also for policyholders to trade the policies on secondary markets that they create.

### Zivo Protocol

**Junyi:** You could think of it as a form of synthetic credit derivatives where on-chain folks want to lend to real-world small businesses and consumer loans. There is some form of leverage here because what Zivo does is it actually tranches it into senior and junior tranches. This creates leverage for junior tranches, and that's essentially how they push up some of their yields. As Wally mentioned, it's pretty new and tiny, but this one was something that we found interesting.

### Credit Coop

**Junyi:** The third one, which is really interesting, is called Credit Coop. While the earlier ones collateralize your lines of credit for your homes and insurances, what Credit Coop does is allow businesses to collateralize their future cash flow. Some businesses highlighted here include Ramp - I think some of us probably use it. Ramp is one of the biggest infra for crypto cards. Your likes of EtherFi cards are all powered by Ramp.

Businesses like Ramp can actually come on here to collateralize their future cash flow and then use that to borrow stablecoins from lenders. This is cool because you can extend this sort of idea to someone who wants to collateralize their salary and use that to borrow stablecoins.

The way they do it is they work with these businesses, get them KYC'd, and then have them boost their future cash flow. They deploy smart contracts and have these businesses stream this cash flow from month one, month two, month three into this smart contract, which then distributes to users who lend to it.

## Discussion and Q&A

### Self-Paying Debt Mechanisms

**Qt:** I thought the comparison to Alchemix from this cycle is pretty interesting on the Zivo side. I personally think the self-paying debt just makes a ton of sense structurally. Is Zivo kind of like the only place you guys saw that, or was that primitive kind of in other credit markets?

**Wally:** Juni found one that's conceptually similar in the sense that the spigot mechanism - the whole idea is that rather than paying or having an obligation to pay immediately or based on some time frame, it's based on your actual streaming revenue. For example, if you were a business and sold ice cream cones, a fraction of your sales would go into repaying the actual loan. Obviously, if you didn't make any money, you would not be paying the loan back. So in that sense, you only pay back the loan if you're making money.

**Junyi:** That mechanism is also being used by Credit Coop, which is a much larger protocol than Zivo. Zivo is focusing on consumer marketing. Credit Coop is focusing on a different sector and does real estate too.

### Market Structure and Hedging

**Qt:** When you think about the Parcel market that turns into real estate exposure, a lot of people ask about hedging. When you think about sourcing the locate for that hedge, the interest rate you pay for locates on the short side, but like positive carry collateral - so it's kind of like a natural hedge, right? You can effectively maybe arbitrage between the positive carry that the platform gets on the asset that you're long versus what you have to pay on the short side.

**Wally:** You're basically saying if there is some sort of mechanism where I have positive carry assets that would pay off the actual fees required to hold the short position, right? I don't know enough about the exact mechanism or economics of something like Parcel.

**Qt:** The core thing I'm trying to get at is that you need to look at every single perp, and if you look at funding rates on most perpetuals, most perp rates on non-stablecoin pairs, for the most part, they don't want to pay the funding rate. But if you were to do that with the shorts market, it'd be kind of interesting to have perp decks where there is no notion like the value of the positive carry of the collateral kind of negates the funding rate.

One of the worst things about perps is that you don't want to really post volatile collateral because it could decay against your collateral and you get liquidated. But one of the interesting things about this is if you have self-repaying positive carry collateral, the mechanics are going to be different because now if you're long one asset versus the other, the underlying is generating positive carry that can offset what you have to pay for the funding rate.

## Future Opportunities and Applications

### AI Integration Points

**Wally:** From my point of view, there are two aspects that I would be interested in. First, there's the whole privacy aspect - enabling private stuff on chain is going to be very important regulatory-wise. Right now, everything is just public, and I assume that might cause issues. Having the capability to have stuff that's actually encrypted is going to be a big unlock.

The other thing is about automation. These protocols are being bottlenecked because people are trying to make their TVL more productive. But at the end of the day, within RWA, you can't do much if you just don't have enough loans. The bottleneck is not being able to automate quick enough. We could help because a lot of our primitives really just make it so that things can be automated. You don't have to worry about keepers, and obviously everything is verified. All the analytics can be on-chain. You can leverage models that I'm sure these people are already doing off-chain to do credit checks and all that stuff.

### Market Outlook

**Qt:** I don't think private credit is going anywhere. I think it's here to stay for quite a bit. It really grew in 2020, mid-2021. Until we actually start to see more of a bubble there - and it is a bubble - if you look at how much new capital Apollo, Blackstone, and KKR in the world, those credit funds have soaked up, it's like 50x over the last six years.

There is something weird looming in the private credit space. That's still 15% if you can get your dollar in the door. It's an access game - most of this is an access game in terms of higher quality credit. So it's going to be very interesting to see how to democratize that a tiny bit.

## Next Steps

**Qt:** We should obviously have a follow-up meeting, maybe talk about specific Ritual prototypes that people can launch or AI agents on these platforms. I think that'd be kind of fun to make it interactive and try to make it very clear on how to build these overnight type solutions.

I think there's a lot of other value that overlays can provide to some of these folks, and maybe there's a very clear set of B2B type things just by reaching them and getting connected to the up-and-coming Zivos of the world.

**Meeting concluded with thanks to all participants**