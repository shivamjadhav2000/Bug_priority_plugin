---
title: Bug Priority Multiclass
emoji: 💻
colorFrom: red
colorTo: gray
sdk: docker
pinned: false
short_description: This is a Multiclass Bug Priority Model
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

tags:
- text-classification
- accessibility
- bug-triage
- transformers
- roberta
- pytorch-lightning
license: apache-2.0
datasets:
- custom
language:
- en

# RoBERTa Base Model for Accessibility Bug Priority Classification

This model fine-tunes `roberta-base` using a labeled dataset of accessibility-related bug descriptions to automatically classify their **priority level**. It helps automate the triage of bugs affecting users of screen readers and other assistive technologies.


## 🧠 Problem Statement

Modern applications often suffer from accessibility issues that impact users with disabilities, such as content not being read properly by screen readers like **VoiceOver**, **NVDA**, or **JAWS**. These bugs are often reported via issue trackers or user forums in the form of short text summaries.

Due to the unstructured and domain-specific nature of these reports, manual triage is:
- Time-consuming
- Inconsistent
- Often delayed in resolution

There is a critical need to **prioritize accessibility bugs quickly and accurately** to ensure inclusive user experiences.


## 🎯 Research Objective

This research project builds a machine learning model that can **automatically assign a priority level** to an accessibility bug report. The goal is to:

- Streamline accessibility QA workflows
- Accelerate high-impact fixes
- Empower developers and testers with ML-assisted tooling

## 📊 Dataset Statistics

The dataset used for training consists of real-world accessibility bug reports, each labeled with one of four priority levels. The distribution of labels is imbalanced, and label-aware preprocessing steps were taken to improve model performance.
| Label | Priority Level | Count |
|-------|----------------|-------|
| 1     | Critical       | 2035  |
| 2     | Major          | 1465  |
| 0     | Blocker        | 804   |
| 3     | Minor          | 756   |

**Total Samples**: 5,060

### 🧹 Preprocessing

- Text normalization and cleanup  
- Length filtering based on token count  
- Label frequency normalization for class-weighted loss  

To address class imbalance, class weights were computed as inverse label frequency and used in the cross-entropy loss during training.

## 🧪 Dataset Description

The dataset consists of short bug report texts labeled with one of four priority levels:

| Label | Meaning     |
|-------|-------------|
| 0     | Blocker     |
| 1     | Critical    |
| 2     | Major       |
| 3     | Minor       |

### ✏️ Sample Entries:

```csv
Text,Label
"mac voiceover screen reader",3
"Firefox crashes when interacting with some MathML content using Voiceover on Mac",0
"VoiceOver skips over text in paragraphs which contain <strong> or <em> tags",2
```


## 📊 Model Comparison

We fine-tuned and evaluated three transformer models under identical training conditions using PyTorch Lightning (multi-GPU, mixed precision, and weighted loss). The validation accuracy and F1 scores are as follows:

| Model           | Base Architecture          | Validation Accuracy | Weighted F1 Score |
|-----------------|----------------------------|---------------------|-------------------|
| DeBERTa-v3 Base | microsoft/deberta-v3-base  | **69%**             | **0.69**          |
| ALBERT Base     | albert-base-v2             | 68%                 | 0.68              |
| RoBERTa Base    | roberta-base               | 66%                 | 0.67              |

### 📝 Observations

- **DeBERTa** delivered the best performance, likely due to its *disentangled attention* and *enhanced positional encoding*.
- **ALBERT** performed surprisingly well despite having fewer parameters, showcasing its efficiency.
- **RoBERTa** provided stable and reliable results but slightly underperformed compared to the others.


# RoBERTa Base Model for Accessibility Priority Classification

This model fine-tunes `roberta-base` using a 4-class custom dataset to classify accessibility issues by priority. It was trained using PyTorch Lightning and optimized with mixed precision on multiple GPUs.

## Details

- **Model**: roberta-base
- **Framework**: PyTorch Lightning
- **Labels**: 0 (Blocker), 1 (Critical), 2 (Major), 3 (Minor)
- **Validation F1**: 0.71 (weighted)

## Usage

```python
from transformers import RobertaTokenizer, RobertaForSequenceClassification
import torch

model = RobertaForSequenceClassification.from_pretrained("shivamjadhav/roberta-priority-multiclass")
tokenizer = RobertaTokenizer.from_pretrained("shivamjadhav/roberta-priority-multiclass")

inputs = tokenizer("VoiceOver skips over text with <strong> tags", return_tensors="pt")
outputs = model(**inputs)
prediction = torch.argmax(outputs.logits, dim=1).item()

print("Predicted Priority:", prediction)
```

