The Loyalty Program defines rules for acquiring points and rewards on which they can be spent.

Rules can be defined globally for all products (fields on loyalty.program) and / or rules that are applied only on specific product or PoS category (loyalty.rule records) on a *points per product sold* or *points per currency spent* basis. The specific rules (loyalty.rule) can be defined as cumulative, which means that they will be aggregated with other matching rules (loyalty.rule records and loyalty.program fields). In the case of non-cumulative rules only the points from that one matching rule are used. Additionally, *fixed points per order* can be added which are applied regardless of whether or not cumulative or non-cumulative rules were applied also.

Rewards can be of three types:

* *Gift* - give a single unit of product for free
* *Discount* - give a discount to the whole order. It should be added at the end of the order so that the correct total price is used.
* *Resale* - allow for customer to sell back his earned points. These are calculated by setting the price on the Resale product (*resale_product.list_price* * *customer.loyalty_points*)

All rewards can define how many points they cost (point_cost) and how many are needed so that the customer can become eligable for the reward (minimum_points). for Gift and Discount rewards minimum_points are considered only if they are greater then the point_cost for that reward (minimum_points > point_cost). For Resale products only minimum_points can be used.
