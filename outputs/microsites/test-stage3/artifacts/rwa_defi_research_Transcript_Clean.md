# RWA + DeFi '26 Overview Meeting Transcript

**Date:** January 15  
**Participants:** Emperor, Qt, Hans, Jody Rebak, Wally, Niraj Pant, Junyi, Akilesh Potti, Arshan, Bperszyk, Wooglin, Kartik

## Market Overview and Evolution

**Wally:** Tokenized assets exceed $35 billion. Before we get into what we think are the reasons for that, I think it's worth talking about how things have evolved since DeFi summer in 2021. 

In 2021, we started out with things like Compound and Aave where the main experiment was about bringing rates of experimentation - really having assets collateralized with overcollateralized lending. It was more about letting consumers borrow against their collateral. There was definitely a movement towards being able to have riskier assets or more long tail assets enabled. Things like Cream Finance came out, and there were obviously other protocols that went in that direction.

As a lot of you know, there were a lot of events that caused risk events that caused the whole industry to evolve in the sense that they first started to look into having risk controls integrated with these protocols. They started to curtail a lot and come up with ways to try to manage this type of risk - things like Morpho and Euler that try to compartmentalize individual assets.

This sort of coincides with how RWAs are evolving. Early RWAs - one of the earlier players was Maple Finance. Basically, they wanted to do undercollateralized lending for folks, and they were on the riskier side of things. There was definitely still a push to go towards that, but I think the industry just wasn't mature enough or there wasn't enough infrastructure to really be able to do that properly. The industry didn't really have the proper tooling to price that risk, and there wasn't really enough analytics to allow something like Maple at that time to scale properly.

Maple had risk events where a bunch of players defaulted, and they promptly moved towards a shift towards more asset-backed collateral where it's no longer undercollateralized - in some sense, actually collateralized.

## Key Market Drivers

**Wally:** The two main things that we think sparked this change are macro regulatory tailwinds that really enabled and sparked the interest, and products that allow people to gain better yield. That really got accelerated by institutional adoption. Now we're entering this phase where, now that there's institutional adoption, there's going to be opportunity for people to expand on that and provide more crypto-native DeFi primitives on top of it.

### Macro Regulatory Tailwinds

The first point is macro regulatory tailwinds. Everyone remembers when the Fed normalized the risk-free rate to roughly 4-5% last year. That immediately created - for people that have some money in savings accounts, you were probably getting 1-2% in your savings account. There was now an easy way, a very low-risk way, to get 4-5% yields by using treasuries. By simply tokenizing those treasuries, people that had a lot of on-chain assets could basically get exposure to this yield in a relatively risk-free way. On the macro side, that's one of the big things that happened - one of the initial demands for RWAs, which was basically tokenized treasuries.

On the regulatory side, there's definitely more pro-crypto initiatives that were happening this year. One of them is obviously the pro-crypto initiatives and FIT21 Act. Among the reports that we saw, this was definitely one of the key events that we see driving institutional adoption.

### Institutional Adoption

One of the biggest adopters on the institutional side was definitely BlackRock with their BUIDL fund. BlackRock and Ondo Finance - you can think of Ondo Finance as the provider that is tokenizing. You can think of it as BlackRock issuing institutionalized assets and Ondo tokenizing them so that people on-chain can actually get exposure to them. This single event really kick-started the acceleration of RWAs last year.

## Current State and Opportunities

**Wally:** One of the things that a lot of folks feel is that RWAs, at least when they were initially conceived, were more focused on just bringing things on-chain. There was not much focus on making things composable. There was not much focus on assets that were originated on-chain. These mostly focused on off-chain stuff like treasuries and real estate, trying to just one-for-one bring it on-chain. There's not a lot of effort to really leverage the crypto-native features that are available. But I think that is really changing right now. Junyi and I found a lot of really interesting use cases that we think are uniquely crypto-native.

### Multi-chain Infrastructure

In 2026, the stack for RWAs is now really multi-chain. It's clear that Ethereum is now trusted as institutional security and settlement layer - sort of king-made by BlackRock choosing them for settlements. But you have other L2s that also help the institutional adoption here.

Provenance and Plume are two examples that are highlighted. You can think of Provenance and Plume as taking opposite approaches to making RWAs more crypto-native. Provenance is focusing on just making the stuff that's on-chain legal - they really care about KYC and compliance built into their chain. Plume is more focused on having a standard RWA stack, so you can think of it as just a standard for all RWAs rather than everyone creating their own. Plume is more focused on bringing RWAs into other DeFi primitives like RWA-specific borrow-lend platforms.

### AI Integration Opportunities

**Wally:** Among the things that we think are interesting - even today, a lot of the protocols that are built aren't really leveraging AI features on-chain. At least when we did research, only a couple even mentioned that they have some sort of AI analytics built in, and most of it is off-chain and not transparent.

Bid.io is the only other one that I saw that tried to do anything AI-related. Basically, they're an AI oracle for pricing risks related to RWA assets. But frankly, they're more of a specialization of what obviously we can provide.

Most of the things that we saw were more focused on really just making things more compliant and having more interesting business use cases.

## Protocol Deep Dive

**Wally:** As RWAs become more complex, one of the problems that we saw - for example, one of the protocols called Zivo, which is basically an RWA protocol that connects loans and liquidity in merchant cash advance markets. You can think of merchant cash advance markets as something like - you're a retail shop that wants to borrow money, but rather than repaying on a time commitment, a portion of your actual sales goes to the repayment.

That creates a really interesting structure where you only pay when you make money. As Junyi put it, this type of structure is sort of self-paying, almost like in some sense similar to Alchemix for those that remember that protocol.

For things like this, one of the problems is you have a lot of idle capital the moment that your loans are fulfilled. You have potentially a lot of idle capital sitting in the protocol. One of the things that we feel could be interesting is having AI scale that process to originate more loans so that the capital is less likely to sit there idle. Rather than have someone manually do a lot of the loan origination, you can have AI to help scale that process and automate a lot of the things that are currently done manually.

### Key Incumbents

**Wally:** Maple, as I mentioned earlier, is one of the older players that started out with undercollateralized loans but now have really pivoted to asset-backed secured lending. They've done fairly well last year. Clearpool is also another player. The main one that people haven't heard about is really Zivo, which I just mentioned - that is going with this interesting model where part of your revenue stream is basically used to pay back your loan.

The reason why this protocol in particular was highlighted is because it's one of the protocols that from a revenue-to-TVL basis is relative to the other RWA protocols out there. Between 1-3% annualized is what we saw. Zivo is on the higher end - it's on the order of 3.6%. That's the reason why we chose to show it here, but it is also one of the newer ones, so it's a little less proven. It hasn't even been a year yet, but it's $1 million in revenue on roughly $16 million deposits, and 95% of those deposits are generally used all the time.

## Specific Protocol Analysis

**Junyi:** Let me share some specific protocols that constantly came up during our research across chains. I think one of the big ones that I was surprised by in terms of TVL - this one is controversial, not sure if some of you have seen on X a couple of months back - this one was Provenance.

### Provenance Blockchain

**Junyi:** Provenance is a chain that's been around for quite some time, it's just not been talked about much. It's actually the guys behind Figure Markets, SoFi folks. If you go to the website, you can see some of the numbers - it's pretty incredible. I say incredible because it's really huge. If you see the TVL, they claim to have $20 billion TVL. Obviously, something that Wally and I like to do is cross-check on-chain if this is real.

There's some controversy because DeFiLlama was never able to prove this number. Figure Markets came out to say some of these things can't be proven on-chain because a large part of it - $15 billion - is basically home equity lines of credit that have been tokenized on-chain. So it's massive amounts of lines of credit that were traditionally not on-chain, but it's all been tokenized. And $600 million of the TVL is actually insurance.

What was interesting with this is Figure Markets is basically bringing in a bunch of different RWAs - lines of credit for home equity, insurance. I think they just announced yesterday that they're going to allow people to borrow and lend using their tokenized stocks. So with this, your traditional assets can be tokenized to borrow stuff.

They had this product called Prime - basically allowing people, lenders, to use collateral that's actually not just crypto but also real assets like homes and houses. The other big push by Provenance is basically the insurance side of things. In 2025, they only had $100 million tokenized in insurance, but right now they actually have $600 million in insurance tokenized on-chain.

This was one of the categories in a bunch of 2026 outlook reports we read through - basically allowing people to have automatic insurance payouts triggered by off-chain events such as hurricanes, huge natural fires, various kinds of natural disasters, or death of relatives, allowing auto payouts. Obviously, the idea there is also for policyholders to at some point trade these policies on secondary markets that they create.

It's basically opening up this market where lenders can actually access high yields against all these RWAs.

### Zivo Protocol

**Junyi:** The second protocol, which Wally had mentioned, was Zivo. You could think of it as a form of synthetic credit derivatives as well, where on-chain folks want to lend to real-world small businesses and consumer loans. There is some form of leverage here because what Zivo does is it actually crunches it into senior and junior tranches. This creates leverage for junior tranches, and that's essentially how they push up some of their yields.

As Wally mentioned, it's pretty new and tiny, but this one was something that we found on DeFiLlama.

### Credit Coop

**Junyi:** The third one, which is really interesting as well, is called Credit Coop. The earlier ones collateralize your lines of credit for your homes, your insurance. What Credit Coop does is interesting - they actually allow businesses to collateralize their future cash flow.

Some businesses highlighted here - Ramp is a super stable coin flow. I'm not sure if anyone follows the crypto cards, but some of you probably use it. Ramp is one of the biggest infra for crypto cards - your likes of EtherFi cards are all powered by Ramp.

Businesses like Ramp can actually come on here to collateralize their future cash flow, and using that, they can borrow stablecoins from lenders like you and me. You can see the yields - earlier last year it was in the twenties.

This is cool because you can extend this sort of idea to someone wanting to collateralize their salary and using that to borrow stablecoins. The way they do it is they work with these businesses, they get KYC, and then they have them boost their future cash flow. They deploy a bunch of smart contract escrows and have these businesses stream this cash flow from month one, month two, month three into this smart contract, which then pays out to users who lend to them.

These were some of the more interesting protocols that we've seen in terms of how RWAs have been brought into crypto markets that we've been familiar with. It's not just your traditional RWA money markets.

## Discussion and Q&A

**Qt:** I thought the comparison to Alchemix from this cycle is pretty interesting on the Zivo side. I personally think the self-repaying debt just makes a ton of sense structurally. Is Zivo kind of like the only place you guys saw that, or was that primitive kind of in other credit markets?

**Wally:** Junyi is the one that found it. It's conceptually similar in the sense that the escrow mechanism that he was mentioning - the whole idea is that rather than paying or having an obligation to pay immediately or based on some time frame, it's based on your actual streaming revenue. For example, if you were a business and sold ice cream cones, a fraction of your sales would go into repaying the actual loan. Obviously, if you didn't make any money, you would not be paying the loan back. So in that sense, you only pay back the loan if you're making money.

That mechanism is also being used by Credit Coop, which is a much larger protocol than Zivo. I think Zivo is focusing on consumer marketing. Credit Coop is focusing on a different sector.

**Junyi:** Credit Coop - one of the biggest names here is Ramp, which powers a lot of the crypto cards out there. The biggest example is obviously EtherFi, which a lot of you have heard about. EtherFi makes money on transaction fees and all that. You can certainly imagine a business like Ramp where they are acting as a service provider for folks that use something like EtherFi - there is the ability to make loans. Rather than paying directly with stablecoins, Ramp as a service provider can make money off of that, and you can imagine that income stream going into being paid out to whoever is lending the money.

## Ritual Integration Opportunities

**Qt:** Where do you think AI could be helpful? There's this point of better curating and matching. There's this notion of better risk modeling. What do you guys think?

**Wally:** My personal inclination is two aspects that I would be interested in. First of all, there's the whole privacy aspect that I know we're working on because of ZK. I think that's going to be very important. Privacy is going to be - putting private stuff on-chain is going to be very important regulatory-wise. Right now, everything is just public, and I assume that might cause issues. So having the capability to have stuff that's actually encrypted is going to be a big unlock.

The other thing for me is - it's all cool to have AI agents and stuff, but really, if we can truly say that these protocols are being bottlenecked... I think one of the things they're saying is people are trying to make their TVL more productive. That's the whole reason why people want to be doing leverage and all that. But at the end of the day, within RWAs, you can't do much if you just don't have enough loans.

I think that in itself, the bottleneck is not being able to automate quick enough. Obviously, we could be - I know we're an AI chain, but a lot of our primitives really just make it so that things can be automated. You don't have to worry about keepers and stuff. You don't have to worry about - obviously, everything is all verified, and all the analytics can be on-chain. You can leverage models that I'm sure these people are already doing off-chain to do credit checks and all that stuff.

**Qt:** I think there's something there with the self-repaying debt plus perpetuals. When you think about the perpetual market, a lot of people complain about: one, they don't want to pay the funding; two, they don't want to post funds; three, they don't like when the funding pays against their collateral in a way that's volatile because then they get liquidated.

I'm trying to work backwards from those three annoyances. Could we have an autonomous payback by proxy from the collateral? My intuition is that most people get long perpetuals not to actually generate yield, but if they have the spot and the spot is generating positive carry, then the position is free.

**Wally:** That is exactly the use case. It could be useful for people that want to do more complex on-chain strategies.

## Closing Thoughts

**Qt:** The only other question I had is, did you guys try to use Zivo or any of these?

**Junyi:** No, it was kind of annoying because not all these protocols require some form of KYC. I guess it's because it's RWAs.

**Wally:** That's definitely one of the things we're seeing as part of the institutionalization. A lot of these are basically - the two chains I mentioned, Provenance and Plume, are just building in KYC at the chain level. One thought is, would we want to do that? Obviously, the answer is probably not. We don't want to be in the business of originating assets, but again, what they're missing is this intelligence layer stuff.

**Qt:** I think your last point about reaching out to the up-and-coming Zivos of the world - I don't think private credit is going anywhere. I think it's here to stay for quite a bit. There is something weirdly looming in the private credit space. It's going to be very interesting to see how to democratize that a bit.

If people on this call could put $1,000 into high-quality credit, most funds don't want your thousand dollars - they're oversubscribed. And people don't want long lockups. I think it's a very interesting, rich space. There's something very unique about real estate markets where it's very clear that an LLM could add value to the multi-modality stuff when you're thinking about scaling real estate at large.

I know all the existing real estate platforms suck in terms of their analytics because they're just using legacy models that don't make any sense. We have to work backwards from what these companies are struggling with. That's another Ritual-type thing. Ideally, I just want to have a bunch of companies like this where we're chatting with them every few days to try to ideate on pain points that the Ritual platform can just plug into.

**Wally:** Thanks, everyone. Thanks from me and Junyi. I know it's 2 AM for you guys. Appreciate you all.