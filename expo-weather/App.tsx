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
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  const [saved, setSaved] = useState<string[]>([]);

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

  const fetchWeatherByCoords = useCallback(
    async (lat: number, lon: number) => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Anfrage fehlgeschlagen: ${res.status}`);
        }
        const json: WeatherResponse = await res.json();
        setData(json);
        const display = [json.name, json.sys?.country].filter(Boolean).join(", ");
        if (display) setLocation(display);
      } catch (e: any) {
        setError(e?.message || "Etwas ist schiefgelaufen.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const onSubmit = useCallback(() => {
    fetchWeather(location);
    Keyboard.dismiss();
  }, [location, fetchWeather]);

  // Saved locations persistence
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("@saved_locations");
        if (raw) setSaved(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const persistSaved = useCallback(async (next: string[]) => {
    setSaved(next);
    try {
      await AsyncStorage.setItem("@saved_locations", JSON.stringify(next));
    } catch {}
  }, []);

  const saveLocation = useCallback(
    (name: string) => {
      const city = name.trim();
      if (!city) return;
      const list = [city, ...saved.filter((s) => s.toLowerCase() !== city.toLowerCase())];
      const limited = list.slice(0, 5); // keep up to 5
      persistSaved(limited);
    },
    [saved, persistSaved]
  );

  const removeLocation = useCallback(
    (name: string) => {
      const next = saved.filter((s) => s.toLowerCase() !== name.toLowerCase());
      persistSaved(next);
    },
    [saved, persistSaved]
  );

  const onPressSaved = useCallback(
    (name: string) => {
      setLocation(name);
      fetchWeather(name);
    },
    [fetchWeather]
  );

  const useMyLocation = useCallback(async () => {
    try {
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Standortberechtigung erforderlich.");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      // Try reverse geocode for display + saving
      try {
        const places = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const p = places?.[0];
        const display = [p?.city || p?.subregion, p?.country].filter(Boolean).join(", ");
        if (display) {
          setLocation(display);
          saveLocation(display);
        }
      } catch {}
    } catch (e: any) {
      setError(e?.message || "Konnte Standort nicht ermitteln.");
    }
  }, [fetchWeatherByCoords, saveLocation]);

  const conditions = data?.weather?.[0]?.main ?? "";

  // Deutsch-Übersetzungen für OpenWeatherMap
  const translateWeather = useCallback((w?: { id?: number; main?: string; description?: string }) => {
    const id = w?.id ?? 0;
    const main = (w?.main ?? "").toLowerCase();
    const desc = (w?.description ?? "").toLowerCase();

    const mainMap: Record<string, string> = {
      clear: "Klar",
      clouds: "Wolken",
      rain: "Regen",
      drizzle: "Nieselregen",
      thunderstorm: "Gewitter",
      snow: "Schnee",
      mist: "Nebel",
      smoke: "Rauch",
      haze: "Dunst",
      dust: "Staub",
      fog: "Nebel",
      sand: "Sand",
      ash: "Asche",
      squall: "Böen",
      tornado: "Tornado",
    };

    const descMap: Record<string, string> = {
      // Clear/Clouds
      "clear sky": "Klarer Himmel",
      "few clouds": "Wenige Wolken",
      "scattered clouds": "Aufgelockerte Bewölkung",
      "broken clouds": "Aufgerissene Bewölkung",
      "overcast clouds": "Bedeckt",
      // Rain
      "light rain": "Leichter Regen",
      "moderate rain": "Mäßiger Regen",
      "heavy intensity rain": "Starker Regen",
      "very heavy rain": "Sehr starker Regen",
      "extreme rain": "Extremer Regen",
      "freezing rain": "Gefrierender Regen",
      "light intensity shower rain": "Leichter Regenschauer",
      "shower rain": "Regenschauer",
      "heavy intensity shower rain": "Heftiger Regenschauer",
      "ragged shower rain": "Unregelmäßiger Regenschauer",
      // Drizzle
      "light intensity drizzle": "Leichter Nieselregen",
      drizzle: "Nieselregen",
      "heavy intensity drizzle": "Starker Nieselregen",
      "light intensity drizzle rain": "Leichter Nieselregen",
      "drizzle rain": "Nieselregen",
      "heavy intensity drizzle rain": "Starker Nieselregen",
      "shower rain and drizzle": "Schauer und Nieselregen",
      "heavy shower rain and drizzle": "Starker Schauer und Nieselregen",
      "shower drizzle": "Nieselschauer",
      // Thunderstorm
      "thunderstorm with light rain": "Gewitter mit leichtem Regen",
      "thunderstorm with rain": "Gewitter mit Regen",
      "thunderstorm with heavy rain": "Gewitter mit starkem Regen",
      "light thunderstorm": "Leichtes Gewitter",
      thunderstorm: "Gewitter",
      "heavy thunderstorm": "Starkes Gewitter",
      "ragged thunderstorm": "Unregelmäßiges Gewitter",
      // Snow
      "light snow": "Leichter Schneefall",
      snow: "Schnee",
      "heavy snow": "Starker Schneefall",
      sleet: "Schneeregen",
      "light shower sleet": "Leichter Schneeregenschauer",
      "shower sleet": "Schneeregenschauer",
      "light rain and snow": "Leichter Regen und Schnee",
      "rain and snow": "Regen und Schnee",
      "light shower snow": "Leichter Schneeschauer",
      "shower snow": "Schneeschauer",
      "heavy shower snow": "Heftiger Schneeschauer",
      // Atmosphere
      mist: "Nebel",
      smoke: "Rauch",
      haze: "Dunst",
      "sand/dust whirls": "Sand-/Staubwirbel",
      fog: "Nebel",
      sand: "Sand",
      dust: "Staub",
      "volcanic ash": "Vulkanasche",
      squalls: "Böen",
      tornado: "Tornado",
    };

    // Prefer code-specific mapping for clouds variants
    let deDesc: string | undefined;
    if (id === 800) deDesc = "Klarer Himmel";
    else if (id === 801) deDesc = "Wenige Wolken";
    else if (id === 802) deDesc = "Aufgelockerte Bewölkung";
    else if (id === 803) deDesc = "Aufgerissene Bewölkung";
    else if (id === 804) deDesc = "Bedeckt";
    else deDesc = descMap[desc];

    const deMain = mainMap[main] || (deDesc ? deDesc : w?.main ?? "");
    return { deMain, deDesc: deDesc ?? (w?.description ?? "") };
  }, []);

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
    const de = translateWeather(data.weather?.[0]);
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
      { key: "cond", label: "Bedingung", value: `${de.deDesc || "-"}` },
    ];
  }, [data, translateWeather]);

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

          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={useMyLocation} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>📍 Meinen Standort</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => saveLocation(location)} style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>➕ Speichern</Text>
            </TouchableOpacity>
          </View>

          {saved.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <FlatList
                horizontal
                data={saved}
                keyExtractor={(item) => item}
                contentContainerStyle={{ gap: 8 }}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    <TouchableOpacity onPress={() => onPressSaved(item)}>
                      <Text style={styles.cardText}>{item}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeLocation(item)} accessibilityRole="button">
                      <Text style={styles.cardRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>
          )}

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
                    {translateWeather(data.weather?.[0]).deMain}
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
  secondaryButton: {
    backgroundColor: "#1f2630",
    borderColor: "#2a3441",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#1a1f27",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#2a3441",
  },
  cardText: {
    color: "#d9e6f2",
    fontWeight: "600",
  },
  cardRemove: {
    color: "#99a8b8",
    marginLeft: 4,
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
