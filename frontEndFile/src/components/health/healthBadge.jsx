

const HealthBadge = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "healthy":
        return "#16a34a";
      case "degraded":
        return "#f59e0b";
      case "broken":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  return (
    <span
      style={{
        backgroundColor: getColor(),
        color: "#fff",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
      }}
    >
      {status ? status.toUpperCase() : "UNKNOWN"}
    </span>
  );
};

export default HealthBadge;