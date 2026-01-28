package dev.jettro.knowledge.proposition;

import com.embabel.agent.rag.model.NamedEntity;
import com.fasterxml.jackson.annotation.JsonClassDescription;

@JsonClassDescription("A product described in the text, such as Embabel, Spring AI, Amazon Bedrock")
public interface Product extends NamedEntity {
}
