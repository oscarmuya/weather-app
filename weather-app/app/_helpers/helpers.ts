export const fetchThumbnail = async (city: string) => {
  const url = "/api/landmark/" + `?city=${encodeURIComponent(city)}`;
  const resp = await fetch(url);
  const json = await resp.json();
  const link = json.imageUrl;
  return link;
};

const getOrdinal = (day: number): string => {
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const dayWithOrdinal = getOrdinal(date.getDate());
  const monthName = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${dayWithOrdinal} ${monthName} ${year}`;
};
