import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Typography,
} from "@mui/material";
import { questions } from "../app/faq";
import Info from "./info";
import Title from "./title";

function FaqSection({ answer, index, question }) {
  const contentId = `faq-content-${index}`;
  const headerId = `faq-header-${index}`;
  return (
    <Accordion
      disableGutters
      elevation={0}
      sx={{
        mb: 1.5,
        border: 1,
        borderColor: "divider",
        borderRadius: "12px !important",
        bgcolor: "rgba(255, 255, 255, 0.018)",
        overflow: "hidden",
        "&::before": {
          display: "none",
        },
        "&.Mui-expanded": {
          borderColor: "rgba(255, 194, 71, 0.34)",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreRounded />}
        aria-controls={contentId}
        id={headerId}
        sx={{
          minHeight: 64,
          px: { xs: 2, sm: 2.5 },
          "& .MuiAccordionSummary-content": {
            my: 1.5,
          },
        }}
      >
        <Typography
          component="h3"
          sx={{ color: "text.primary", fontSize: 16, fontWeight: 700 }}
        >
          {question}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        id={contentId}
        aria-labelledby={headerId}
        sx={{
          px: { xs: 2, sm: 2.5 },
          pt: 0,
          pb: 2.5,
          color: "text.secondary",
          "& .MuiTypography-root": {
            color: "inherit",
            lineHeight: 1.75,
          },
        }}
      >
        {answer}
      </AccordionDetails>
    </Accordion>
  );
}

export default function Faq() {
  return (
    <Container maxWidth="md">
      <Title compact />
      <Info
        id="faq-heading"
        title="FAQ"
        subtitle="Straight answers to common questions about Torch and Minecraft server status."
      />
      {questions.map((question, index) => (
        <FaqSection
          key={question.question}
          index={index}
          question={question.question}
          answer={question.answer}
        />
      ))}
    </Container>
  );
}
