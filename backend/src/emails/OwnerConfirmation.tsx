import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OwnerNotificationProps {
  ownerName?: string;
  totalAmount?: string;
  clientName?: string;
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export default function OwnerNotification({
  ownerName = "Propietario",
  totalAmount = "€50.00",
  clientName = "Nombre del Cliente",
  location = "Calle Ejemplo, 123, Madrid",
  checkInDate = "15/12/2025",
  checkOutDate = "20/12/2025",
}: OwnerNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Nueva Reserva Recibida - QuickPark</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={iconSection}>
            <Text style={bellIcon}>🔔</Text>
          </Section>

          <Heading style={heading}>Nueva Reserva Recibida</Heading>

          <Section style={content}>
            <Text style={paragraph}>Hola {ownerName},</Text>

            <Text style={paragraph}>
              ¡Has recibido una nueva reserva!
            </Text>

            <Section style={earningsBox}>
              <Text style={earningsLabel}>Ingresos: <strong>{totalAmount}</strong></Text>
            </Section>

            <Section style={detailsBox}>
              <Text style={detailLabel}>👤 Cliente: {clientName}</Text>
              <Text style={detailLabel}>📍 {location}</Text>
              <Text style={detailLabel}>📅 {checkInDate} - {checkOutDate}</Text>
            </Section>

            <Text style={paragraph}>
              Saludos,<br />
              <strong>QuickPark</strong>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  maxWidth: "500px",
};

const iconSection = {
  textAlign: "center" as const,
  padding: "20px 0",
};

const bellIcon = {
  fontSize: "48px",
  color: "#A855F7",
  margin: "0",
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  color: "#1f2937",
  margin: "0 0 24px",
};

const content = {
  padding: "0",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 16px",
};

const earningsBox = {
  backgroundColor: "#D1FAE5",
  padding: "16px",
  borderRadius: "8px",
  margin: "20px 0",
};

const earningsLabel = {
  fontSize: "16px",
  color: "#065F46",
  margin: "0",
};

const detailsBox = {
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "8px",
  margin: "20px 0",
};

const detailLabel = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 8px",
};
