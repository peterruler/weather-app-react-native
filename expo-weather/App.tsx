import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type WeatherResponse = {
  name: string;
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind?: { speed: number };
  sys?: { country?: string };
};

type InfoRow = { key: string; label: string; value: string };

const API_KEY = "ca4ab639490b58b65967f8a7816cb8d4";

export default function App() {
  const [location, setLocation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Optional background image (assets/bg.png). Falls back to solid dark color when missing.
  let bgImage: any = null;
  try {
    // If the file is not present, this will throw and we'll use the fallback.
    // Provide your image at: expo-weather/assets/bg.png
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    bgImage = require("./assets/bg.png");
  } catch {}

  const fetchWeather = useCallback(async (loc: string) => {
    if (!loc.trim()) {
      setError("Bitte gebe einen Ort ein.");
      return;
    }
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const encoded = encodeURIComponent(loc.trim());
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encoded}&units=metric&appid=${API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) {
        const msg =
          res.status === 404
            ? "Ort wurde nicht gefunden."
            : `Anfrage fehlgeschlagen: ${res.status}`;
        throw new Error(msg);
      }
      const json: WeatherResponse = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Etwas ist schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onSubmit = useCallback(() => {
    fetchWeather(location);
    Keyboard.dismiss();
  }, [location, fetchWeather]);

  useEffect(() => {
    // Optionally preload a default city; left blank per instructions.
  }, []);

  const conditions = data?.weather?.[0]?.main ?? "";

  const heroImage = useMemo(() => {
    const cond = conditions.toLowerCase();
    if (
      cond.includes("rain") ||
      cond.includes("drizzle") ||
      cond.includes("thunder")
    ) {
      return require("./assets/img/rainy.png");
    }
    if (cond.includes("cloud")) {
      return require("./assets/img/cloudy.png");
    }
    if (cond.includes("clear") || cond.includes("sun")) {
      return require("./assets/img/sunny.png");
    }
    // Fallbacks
    return require("./assets/img/cloudy.png");
  }, [conditions]);

  const infoList: InfoRow[] = useMemo(() => {
    if (!data) return [];
    return [
      {
        key: "temp",
        label: "Temperatur",
        value: `${Math.round(data.main.temp)}°C`,
      },
      {
        key: "feels",
        label: "Gefühlt",
        value: `${Math.round(data.main.feels_like)}°C`,
      },
      {
        key: "minmax",
        label: "Min/Max",
        value: `${Math.round(data.main.temp_min)}° / ${Math.round(data.main.temp_max)}°C`,
      },
      {
        key: "humidity",
        label: "Luftfeuchtigkeit",
        value: `${data.main.humidity}%`,
      },
      { key: "wind", label: "Wind", value: `${data.wind?.speed ?? 0} m/s` },
      {
        key: "cond",
        label: "Bedingung",
        value: `${data.weather?.[0]?.description ?? "-"}`,
      },
    ];
  }, [data]);

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="light" />
      <ImageBackground
        source={bgImage ?? undefined}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Wetter</Text>

          <View style={styles.searchRow}>
            <TextInput
              placeholder="Stadt eingeben (z. B. Berlin)"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
              onSubmitEditing={onSubmit}
              returnKeyType="search"
              style={styles.input}
              autoCapitalize="words"
            />
            <TouchableOpacity
              accessibilityRole="button"
              onPress={onSubmit}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Suchen</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#9bdcff" />
              <Text style={styles.muted}>Laden...</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <Text style={styles.error}>{error}</Text>
            </View>
          ) : data ? (
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.location}>
                    {data.name}
                    {data.sys?.country ? `, ${data.sys.country}` : ""}
                  </Text>
                  <Text style={styles.condition}>
                    {data.weather?.[0]?.main ?? ""}
                  </Text>
                </View>
                <Image
                  source={heroImage}
                  style={styles.hero}
                  resizeMode="contain"
                />
              </View>

              <FlatList
                data={infoList}
                keyExtractor={(item) => item.key}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                renderItem={({ item }) => {
                  const isCond = item.key === "cond";
                  return (
                    <View style={styles.row}>
                      <Text style={styles.label}>{item.label}</Text>
                      {isCond ? (
                        <View style={styles.valueRow}>
                          <Image
                            source={heroImage}
                            style={styles.iconSmall}
                            resizeMode="contain"
                          />
                          <Text style={styles.value}>{item.value}</Text>
                        </View>
                      ) : (
                        <Text style={styles.value}>{item.value}</Text>
                      )}
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <View style={styles.center}>
              <Text style={styles.muted}>
                Suche nach einer Stadt, um das Wetter zu sehen.
              </Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0b0f14",
  },
  bg: {
    flex: 1,
    backgroundColor: "#0b0f14",
  },
  container: {
    flex: 1,
    paddingTop: Platform.select({
      ios: 0,
      android: StatusBar.currentHeight ?? 0,
    }),
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 12,
    color: "#e6f2ff",
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: "#1a1f27",
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
    color: "#d9e6f2",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2a3441",
  },
  button: {
    paddingHorizontal: 16,
    height: 44,
    backgroundColor: "#0A84FF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#0a6ad1",
  },
  buttonText: {
    color: "#eef6ff",
    fontWeight: "600",
    fontSize: 16,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },
  muted: {
    color: "#b3c2d1",
    marginTop: 8,
  },
  error: {
    color: "#ff8a80",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  location: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e6f2ff",
  },
  condition: {
    fontSize: 16,
    color: "#c1d0df",
    marginTop: 4,
  },
  hero: {
    width: 84,
    height: 84,
  },
  listContent: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    color: "#d0dceb",
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e6f2ff",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconSmall: {
    width: 20,
    height: 20,
  },
  separator: {
    height: 1,
    backgroundColor: "#2a3441",
  },
});
