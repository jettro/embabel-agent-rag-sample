package dev.jettro.knowledge.proposition;

import com.embabel.agent.rag.model.NamedEntity;
import com.fasterxml.jackson.annotation.JsonClassDescription;

@JsonClassDescription("A programming language such as Java, Python, JavaScript")
public interface ProgrammingLanguage extends NamedEntity {
}
