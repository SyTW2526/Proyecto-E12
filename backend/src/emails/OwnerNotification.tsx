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
  clientEmail?: string;
  location?: string;
  checkInDate?: string;
  checkInTime?: string;
  checkOutDate?: string;
  checkOutTime?: string;
  duration?: string;
}

export default function OwnerNotification({
  ownerName = "Propietario",
  totalAmount = "€50.00",
  clientName = "Nombre del Cliente",
  clientEmail = "cliente@ejemplo.com",
  location = "Calle Ejemplo, 123, Madrid",
  checkInDate = "15/12/2025",
  checkInTime = "10:00 AM",
  checkOutDate = "20/12/2025",
  checkOutTime = "10:00 AM",
  duration = "5 días completos",
}: OwnerNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Nueva Reserva Recibida - ParkingGo</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Bell Icon */}
          <Section style={iconSection}>
            <table style={iconTable}>
              <tr>
                <td style={bellCircle}>
                  <Text style={bellIcon}>🔔</Text>
                </td>
              </tr>
            </table>
          </Section>

          <Heading style={heading}>Nueva Reserva Recibida</Heading>

          <Hr style={divider} />

          {/* Contenido Principal */}
          <Section style={content}>
            <Text style={greeting}>Hola <strong>{ownerName}</strong>,</Text>

            <Text style={paragraph}>
              ¡Buenas noticias! Has recibido una nueva reserva para tu plaza de parking. A continuación encontrarás toda la información.
            </Text>

            {/* Ingresos */}
            <Section style={earningsBox}>
              <table style={earningsTable}>
                <tr>
                  <td style={earningsLeft}>
                    <Text style={earningsLabel}>Ingresos de esta reserva</Text>
                    <Text style={earningsNote}>({totalAmount})</Text>
                  </td>
                  <td style={earningsRight}>
                    <div style={dollarCircle}>
                      <Text style={dollarIcon}>💲</Text>
                    </div>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Información del Cliente */}
            <Section style={clientSection}>
              <Heading as="h3" style={sectionHeading}>
                Información del Cliente
              </Heading>

              {/* Nombre */}
              <table style={infoTable}>
                <tr>
                  <td style={infoIconCell}>
                    <div style={infoIconCircle}>
                      <Text style={infoIcon}>👤</Text>
                    </div>
                  </td>
                  <td style={infoContent}>
                    <Text style={infoLabel}>Nombre</Text>
                    <Text style={infoValue}>{clientName}</Text>
                  </td>
                </tr>
              </table>

              {/* Email */}
              <table style={infoTable}>
                <tr>
                  <td style={infoIconCell}>
                    <div style={infoIconCircle}>
                      <Text style={infoIcon}>📧</Text>
                    </div>
                  </td>
                  <td style={infoContent}>
                    <Text style={infoLabel}>Email</Text>
                    <Text style={infoValue}>{clientEmail}</Text>
                  </td>
                </tr>
              </table>

            </Section>

            {/* Detalles de la Reserva */}
            <Section style={detailsBox}>
              <Heading as="h3" style={sectionHeading}>
                Detalles de la Reserva
              </Heading>

              {/* Tu parking */}
              <Section style={detailItem}>
                <table style={detailTable}>
                  <tr>
                    <td style={detailIconCell}>
                      <div style={detailIconCircle}>
                        <Text style={detailIcon}>🏠</Text>
                      </div>
                    </td>
                    <td style={detailContent}>
                      <Text style={detailLabel}>Tu parking</Text>
                      <Text style={detailValue}>{location}</Text>
                    </td>
                  </tr>
                </table>
              </Section>

              {/* Fechas */}
              <table style={dateTable}>
                <tr>
                  <td style={dateCell}>
                    <Text style={dateLabel}>Check-in</Text>
                    <Text style={dateValue}>{checkInDate}</Text>
                    <Text style={dateTime}>{checkInTime}</Text>
                  </td>
                  <td style={{ width: "20px" }}></td>
                  <td style={dateCell}>
                    <Text style={dateLabel}>Check-out</Text>
                    <Text style={dateValue}>{checkOutDate}</Text>
                    <Text style={dateTime}>{checkOutTime}</Text>
                  </td>
                </tr>
              </table>

              {/* Duración */}
              <Section style={durationSection}>
                <table style={durationTable}>
                  <tr>
                    <td style={detailIconCell}>
                      <div style={detailIconCircle}>
                        <Text style={detailIcon}>🕐</Text>
                      </div>
                    </td>
                    <td style={detailContent}>
                      <Text style={detailLabel}>Duración</Text>
                      <Text style={detailValue}>{duration}</Text>
                    </td>
                  </tr>
                </table>
              </Section>
            </Section>

            {/* Botón CTA */}
            <Section style={buttonContainer}>
              <Button style={button} href="">
                Ver en Panel de Control
              </Button>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "0",
};

const iconSection = {
  textAlign: "center" as const,
  padding: "40px 20px 20px",
};

const iconTable = {
  margin: "0 auto",
  borderCollapse: "collapse" as const,
};

const bellCircle = {
  backgroundColor: "#A855F7",
  borderRadius: "50%",
  width: "80px",
  height: "80px",
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
};

const bellIcon = {
  fontSize: "48px",
  margin: "0",
  lineHeight: "80px",
  display: "inline-block",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#A855F7",
  textAlign: "center" as const,
  margin: "16px 0 24px",
};

const divider = {
  borderColor: "#A855F7",
  borderWidth: "2px",
  margin: "0 54px 32px",
  maxWidth: "80%",
};

const content = {
  padding: "0 54px 48px",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525252",
  margin: "0 0 32px",
};

const earningsBox = {
  backgroundColor: "#D1FAE5",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "32px",
  border: "2px solid #6EE7B7",
};

const earningsTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const earningsLeft = {
  verticalAlign: "middle" as const,
};

const earningsRight = {
  width: "80px",
  textAlign: "right" as const,
  verticalAlign: "middle" as const,
};

const earningsLabel = {
  fontSize: "14px",
  color: "#065F46",
  margin: "0 0 8px",
  display: "block",
};

const earningsNote = {
  fontSize: "30px",
  color: "#059669",
  margin: "0",
  display: "block",
};

const dollarCircle = {
  backgroundColor: "#10B981",
  borderRadius: "50%",
  width: "60px",
  height: "60px",
  textAlign: "center" as const,
  lineHeight: "60px",
  margin: "0 0 0 auto",
};

const dollarIcon = {
  fontSize: "32px",
  margin: "0",
  lineHeight: "60px",
  display: "inline-block",
};

const clientSection = {
  backgroundColor: "#ffffff",
  marginBottom: "32px",
};

const sectionHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 20px",
};

const infoTable = {
  width: "100%",
  marginBottom: "16px",
  borderCollapse: "collapse" as const,
};

const infoIconCell = {
  width: "48px",
  verticalAlign: "top" as const,
  paddingRight: "12px",
};

const infoIconCircle = {
  backgroundColor: "#DBEAFE",
  borderRadius: "8px",
  width: "40px",
  height: "40px",
  textAlign: "center" as const,
  lineHeight: "40px",
};

const infoIcon = {
  fontSize: "20px",
  margin: "0",
  lineHeight: "40px",
  display: "inline-block",
};

const infoContent = {
  verticalAlign: "top" as const,
};

const infoLabel = {
  fontSize: "12px",
  color: "#6B7280",
  margin: "0 0 4px",
  display: "block",
};

const infoValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
  display: "block",
};

const detailsBox = {
  backgroundColor: "#F3E8FF",
  borderRadius: "12px",
  padding: "24px",
  marginBottom: "32px",
};

const detailItem = {
  marginBottom: "24px",
};

const detailTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const detailIconCell = {
  width: "48px",
  verticalAlign: "top" as const,
  paddingRight: "12px",
};

const detailIconCircle = {
  backgroundColor: "#E9D5FF",
  borderRadius: "8px",
  width: "40px",
  height: "40px",
  textAlign: "center" as const,
  lineHeight: "40px",
};

const detailIcon = {
  fontSize: "20px",
  margin: "0",
  lineHeight: "40px",
  display: "inline-block",
};

const detailContent = {
  verticalAlign: "top" as const,
};

const detailLabel = {
  fontSize: "12px",
  color: "#6B7280",
  margin: "0 0 4px",
  display: "block",
};

const detailValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 4px",
  display: "block",
};

const dateTable = {
  width: "100%",
  marginTop: "20px",
  marginBottom: "20px",
  borderCollapse: "collapse" as const,
};

const dateCell = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  verticalAlign: "top" as const,
};

const dateLabel = {
  fontSize: "12px",
  color: "#6B7280",
  margin: "0 0 8px",
  display: "block",
};

const dateValue = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 4px",
  display: "block",
};

const dateTime = {
  fontSize: "14px",
  color: "#6B7280",
  margin: "0",
  display: "block",
};

const durationSection = {
  marginTop: "20px",
};

const durationTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#A855F7",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
};
