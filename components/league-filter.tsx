import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Button } from "@/components/ui/button";
import { spacing } from "@/constants/theme";

interface League {
  id: string;
  name: string;
  country: string;
  emoji: string;
}

interface LeagueFilterProps {
  leagues: League[];
  selectedLeague: string | null;
  onSelect: (leagueId: string | null) => void;
}

export default function LeagueFilter({
  leagues,
  selectedLeague,
  onSelect,
}: LeagueFilterProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.container}>
        <Button
          variant={selectedLeague === null ? "default" : "outline"}
          size="sm"
          onPress={() => onSelect(null)}
        >
          All Leagues
        </Button>

        {leagues.map((league) => (
          <Button
            key={league.id}
            variant={selectedLeague === league.id ? "default" : "outline"}
            size="sm"
            onPress={() => onSelect(league.id)}
          >
            <Text>
              {league.emoji} {league.name}
            </Text>
          </Button>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
