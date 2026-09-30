import { useCards } from "../../cards/hooks/useCards";

export function useAdminCards(initialFilter: string = "all") {
  return useCards(initialFilter);
}
