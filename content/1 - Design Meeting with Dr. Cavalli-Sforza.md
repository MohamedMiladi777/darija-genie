 2026-06-09 10:39

Status:

Tags:


### Topics
#### Architecture and Frameworks
[[1 - DarijaGeni Frameworks]]
[[2 - Darija Genie Architecture]]
[[3 - Logo Design]]

Database solution.
There is a storage problem, where using a traditiona use Amazon S3 or microsoft azure.
#### Design Ideas



Show the design I found on the net.
Go through my moodboard to show the inspirations showing the strong and the weak color accents to refelct the idea of the app.

#### Questions

Do we include a mobile application or just a website?



#### Features

Login is not needed

1) User opens app 
2) session set up (Dark/light mode, English translation, Arabic or Latin script options)
3) Scenario choice (add more scenarios)
	1) **For first timers** : Vocabulary screen pertinent to the scenario (commonly used expressions, words, grammar) with English translation for each expression. 
	2) **Chatbot display** : 
		1) The system gives a prompt to which the user responds or a custom trained LLM for Darija (Backup system if the cloud model is offline)
		* written display, Arabic or Latin script (turn on & off)
		* English Translations
		* Audio only feature (similar to chatgpt voice mode where the user input is transcribed to text)
	3) **Review and Reflection**: Go over the user responses and attempt to correct mistakes(grammar, expressions, pronunciation)  

Testing mechanism (e.g. quiz : General or scenario specific) that could be accessed from the interface (give the user the option to select a scenario) or the conversation.
##### Latter Features
* Ability to record a new audio. (so we can record data for further LLM training)
* A back up custom model

#### To check out 
TTS of the Gemini model
#### 
DarijaGenie
Lightmode & darkmode feature
Desktop first or mobile first (haven't decided yet)

Detectable issues: Topic Shift (leverage previous work of Hamza)
Undetectable issues: Incorrect language (spelling, pronounciation..)

Natural Language Processing / semantic grammar

Media in the conversation/quiz/language preview
### References

---

