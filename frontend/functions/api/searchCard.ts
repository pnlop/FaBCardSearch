
import Search from "@flesh-and-blood/search";
import { DoubleSidedCard } from "@flesh-and-blood/types";
import { cards } from "@flesh-and-blood/cards";

export function onRequest(context) {
  const req = context.request;
  const searchQuery = req.body;
  //from @flesh-and-blood/search search.tests.ts
  const doubleSidedCards: DoubleSidedCard[] = cards.map((card) => {
      if (card.oppositeSideCardIdentifier) {
          const oppositeSideCard = cards.find(
              ({ cardIdentifier }) => cardIdentifier === card.oppositeSideCardIdentifier
          );
          if (oppositeSideCard) {

              (card as DoubleSidedCard).oppositeSideCard = oppositeSideCard;
          }
      }
      return card;
  });

  const search = new Search(doubleSidedCards);
  const searchResults = search.search(searchQuery.query);

  return Response.json(JSON.stringify(searchResults, function(key, value) {
    if(key == 'oppositeSideCard') { 
      return "Double Sided Card (broken behaviour)";
    } else {
      return value;
    };
  }))

}
