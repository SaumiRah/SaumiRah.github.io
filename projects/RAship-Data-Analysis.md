RAship Code
================

## Acknowledgements

The following is an R project I developed to perform data analysis on
historic economic data for my position as a Research Assistant for
Prof. Nicolas Schmitt at Simon Fraser University. The version of this
file published on Github will load redacted versions of proprietary
data. All categorical variables are aliased, and all numeric fields are
shuffled at random to preserve confidentiality. File names and headers
are kept the same.

# Data Processing

``` r
rm(list=ls()) #clear environment

#load libraries
library(purrr)
library(writexl)
library(openxlsx)
library(readxl)
library(tidyverse)
library(graphics)
library(ggthemes)
library(outliers)
library(ggplot2)
library(plyr)
library(dplyr)
library(ggforce)
library(ggrepel)
library(hexbin)
library(latex2exp)
library(rmarkdown)
```

## Summarizing Function: Recategorized Data

``` r
nameG <- paste("Cat", seq(1,17), sep = ".")

recatData <- function(file_path) { #defining summary function

  data <- read_excel(file_path)
  data$Category <- as.factor(data$Category)
  data$`General Import Tax` <- sample(data$`General Import Tax`) #randomizing values
  
  data_summary <- data %>%
    group_by(Category) %>%
    summarise_at(vars(`General Import Tax`), list(mean=mean, sd=sd)) %>%
    as.data.frame()

  data_count <- data %>% dplyr::count(Category)
  data_merged <- left_join(data_summary, data_count, by= 'Category')
  levels(data_merged$Category) <- nameG
  return(data_merged[-c(17), ])

}
```

### 1902

``` r
oTwoDF <- recatData("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1902_Recat_V3.xlsx")
head(oTwoDF) # example of year = 1902
```

    ##   Category     mean        sd   n
    ## 1    Cat.1 32.24651  56.68118 129
    ## 2    Cat.2 51.88235 101.51224  17
    ## 3    Cat.3 27.00161  32.95000  31
    ## 4    Cat.4 67.33871 106.33315  31
    ## 5    Cat.5 24.38889  39.31782  18
    ## 6    Cat.6 39.35234  79.68471  64

## 1891

``` r
nineOneDF <- recatData("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1891_Recat_V2.xlsx")
head(nineOneDF) # example of year = 1891
```

    ##   Category     mean       sd  n
    ## 1    Cat.1 31.44384 55.13447 73
    ## 2    Cat.2 29.25000 39.12935 14
    ## 3    Cat.3 20.35000 33.41192 24
    ## 4    Cat.4 13.50769 15.91035 13
    ## 5    Cat.5 15.30714 24.42592  7
    ## 6    Cat.6 22.79333 32.87008 30

## 1887

``` r
eightSevDF <-recatData("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1891_Recat_V2.xlsx")
head(eightSevDF)
```

    ##   Category     mean       sd  n
    ## 1    Cat.1 32.47260 65.17196 73
    ## 2    Cat.2 30.52143 39.16315 14
    ## 3    Cat.3 25.12500 41.59255 24
    ## 4    Cat.4 27.08462 41.09249 13
    ## 5    Cat.5 34.92857 65.38376  7
    ## 6    Cat.6 30.63500 39.58481 30

## `1884`

``` r
eightFourDF <- recatData("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1884_Recat_V2.xlsx")
head(eightFourDF)
```

    ##   Category     mean       sd  n
    ## 1    Cat.1 15.73359 21.27716 78
    ## 2    Cat.2 10.60417 10.90530 12
    ## 3    Cat.3 16.12500 22.99966 26
    ## 4    Cat.4 17.49167 18.87497 12
    ## 5    Cat.5 15.11111 14.17475  9
    ## 6    Cat.6 17.26167 24.61115 30

## 1851_accepted

``` r
fiveOneDF <- recatData("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1851_accepted_Recat_V3.xlsx")
head(fiveOneDF)
```

    ##   Category      mean        sd  n
    ## 1    Cat.1 4.3239130 4.6650800 46
    ## 2    Cat.2 4.2115385 4.4371610 13
    ## 3    Cat.3 0.9384615 0.8677446 13
    ## 4    Cat.4 6.7083333 5.4369492  6
    ## 5    Cat.5 4.7100000 6.1842946  5
    ## 6    Cat.6 5.2285714 5.8470477 14

## 1849

``` r
fourNine <- read_excel("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1849_Recat_V4.xlsx")
fourNine$Category<-as.factor(fourNine$Category)

#converting Batz to Franc
fourNine <- fourNine %>% 
  mutate(`General Import Tax` = Batz / 7)

fourNine$`General Import Tax` <- sample(fourNine$`General Import Tax`) #randomizing values

fourNineT <- fourNine %>%
  group_by(Category) %>%
  summarise_at(vars(`General Import Tax`), list(mean=mean, sd=sd)) %>% 
  as.data.frame()

fourNineN <- fourNine %>% dplyr::count(Category)
fourNineDF <- left_join(fourNineT, fourNineN, by= join_by(Category))


levels(fourNineDF$Category) <- nameG

fourNineDF <- fourNineDF[-c(17), ]
```

## Creating Nominal Master Data Frame: 1902, 1891, 1887, 1884, 1851, and 1849

``` r
## Master DF... needs to be pivoted
{ppp <- left_join(oTwoDF, nineOneDF, by = join_by(Category));
Tppp <- left_join(ppp, eightSevDF, by = join_by(Category));
Cppp <- left_join(Tppp, eightFourDF, by = join_by(Category));
Gppp <- left_join(Cppp, fiveOneDF, by = join_by(Category));
Qppp<- left_join(Gppp, fourNineDF, by = join_by(Category));
}

## Pivoting Master DF long...
# Pivoting Mean
{mmm = subset(Qppp, select = c(Category, mean.x, mean.y, mean.x.x, mean.y.y, mean.x.x.x, mean.y.y.y));
mmm <- mmm %>%
  pivot_longer(cols=-Category, names_to = 'Year', names_prefix = 'mean.', values_to = "mean");
  
mmm$Year[mmm$Year == "x"] = "1902"; mmm$Year[mmm$Year == "y"] = "1891";
  mmm$Year[mmm$Year == "x.x"] = "1887"; mmm$Year[mmm$Year == "y.y"] = "1884"; mmm$Year[mmm$Year == "x.x.x"]="1851";
  mmm$Year[mmm$Year == "y.y.y"]="1849"
}


# Pivoting SD
{sdDF = subset(Qppp, select = c(Category, sd.x, sd.y, sd.x.x, sd.y.y, sd.x.x.x, sd.y.y.y));
sdDF <- sdDF %>%
  pivot_longer(cols=-Category, names_to = 'Year', names_prefix = 'sd.', values_to = "sd");
  
sdDF$Year[sdDF$Year == "x"] = "1902"; sdDF$Year[sdDF$Year == "y"] = "1891"; sdDF$Year[sdDF$Year == "sd"] = "1887" ;
  sdDF$Year[sdDF$Year == "x.x"] = "1887"; sdDF$Year[sdDF$Year == "y.y"] = "1884"; sdDF$Year[sdDF$Year == "x.x.x"] = "1851";
  sdDF$Year[sdDF$Year == "y.y.y"]="1849"
}

# Pivoting n
{nDF = subset(Qppp, select = c(Category, n.x, n.y, n.x.x, n.y.y, n.x.x.x, n.y.y.y));
nDF <- nDF %>%
  pivot_longer(cols=-Category, names_to = 'Year', names_prefix = 'n.', values_to = "n")
  
nDF$Year[nDF$Year == "x"] = "1902"; nDF$Year[nDF$Year == "y"] = "1891"; nDF$Year[nDF$Year == "n"] = "1887";
  nDF$Year[nDF$Year == "x.x"] = "1887"; nDF$Year[nDF$Year == "y.y"] = "1884"; nDF$Year[nDF$Year == "x.x.x"] = "1851";
  nDF$Year[nDF$Year == "y.y.y"] = "1849"
}


# joining long-pivoted DFs into final DF
fDFt <- left_join(mmm, sdDF, by= join_by(Category, Year))
fDF <- left_join(fDFt, nDF, by= join_by(Category, Year))
fDF[is.na(fDF)] <- 0 # Final Dataframe: "fDF"
```

``` r
# Optional code to write to xlsx file
#Write to excel file (warning: will overwrite file with same name. Make sure to change name and path) 
#write_xlsx(fDF, "D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1902-1849 Master - Real_V2.xlsx")
```

## Real Values

Accounting for a price index; Without accounting for index = “Nominal
values”

``` r
nameG <- paste("Cat", seq(1,17), sep = ".")

realData <- function(df) { #defining summary function

  data <- df
  data$Category <- as.factor(data$Category)
  data$`General Import Tax` <- sample(data$`General Import Tax`) #randomizing values
  
  data_summary <- data %>%
    group_by(Category) %>%
    summarise_at(vars(`General Import Tax`), list(mean=mean, sd=sd)) %>%
    as.data.frame()

  data_count <- data %>% dplyr::count(Category)
  data_merged <- left_join(data_summary, data_count, by= 'Category')
  levels(data_merged$Category) <- nameG
  return(data_merged[-c(17), ])

}


nineOneR <- read_xlsx("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1891_Recat_V2.xlsx") %>% 
    mutate(`General Import Tax` = `General Import Tax` / 1.048)

eightSevR <- read_xlsx("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1887_Recat_V2.xlsx") %>% 
    mutate(`General Import Tax` = `General Import Tax` / .922)

eightFourR <- read_xlsx("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1884_Recat_V2.xlsx") %>% 
    mutate(`General Import Tax` = `General Import Tax` / 1.051)

fiveOneR <- read_xlsx("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1851_accepted_Recat_V3.xlsx") %>% 
    mutate(`General Import Tax` = `General Import Tax` / 0.864)

fourNineR <- read_xlsx("D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1849_Recat_V4.xlsx") %>% 
  mutate(`General Import Tax` = Batz / 7)%>%
  mutate(`General Import Tax` = `General Import Tax` / 0.745)

RnineOneDF <- realData(nineOneR)
ReightSevDF <- realData(eightSevR)
ReightFourDF <- realData(eightFourR)
RfiveOneDF <- realData(fiveOneR)
RfourNineDF <- realData(fourNineR)
```

## Creating Real Master Data Frame: 1902, 1891, 1887, 1884, 1851, and 1849

``` r
## Master DF... needs to be pivoted
{Rppp <- left_join(oTwoDF, RnineOneDF, by = join_by(Category));
TRppp <- left_join(Rppp, ReightSevDF, by = join_by(Category));
CRppp <- left_join(TRppp, ReightFourDF, by = join_by(Category));
GRppp <- left_join(CRppp, RfiveOneDF, by = join_by(Category));
QRppp<- left_join(GRppp, RfourNineDF, by = join_by(Category));
}

## Pivoting Master DF long...
# Pivoting Mean
{Rmmm = subset(QRppp, select = c(Category, mean.x, mean.y, mean.x.x, mean.y.y, mean.x.x.x, mean.y.y.y));
Rmmm <- Rmmm %>%
  pivot_longer(cols=-Category, names_to = 'Year', names_prefix = 'mean.', values_to = "mean");
  
Rmmm$Year[Rmmm$Year == "x"] = "1902"; Rmmm$Year[Rmmm$Year == "y"] = "1891";
  Rmmm$Year[Rmmm$Year == "x.x"] = "1887"; Rmmm$Year[Rmmm$Year == "y.y"] = "1884"; Rmmm$Year[Rmmm$Year == "x.x.x"]="1851";
  Rmmm$Year[Rmmm$Year == "y.y.y"]="1849"
}


# Pivoting SD
{RsdDF = subset(QRppp, select = c(Category, sd.x, sd.y, sd.x.x, sd.y.y, sd.x.x.x, sd.y.y.y));
RsdDF <- RsdDF %>%
  pivot_longer(cols=-Category, names_to = 'Year', names_prefix = 'sd.', values_to = "sd");
  
RsdDF$Year[RsdDF$Year == "x"] = "1902"; RsdDF$Year[RsdDF$Year == "y"] = "1891"; RsdDF$Year[RsdDF$Year == "sd"] = "1887" ;
  RsdDF$Year[RsdDF$Year == "x.x"] = "1887"; RsdDF$Year[RsdDF$Year == "y.y"] = "1884"; RsdDF$Year[RsdDF$Year == "x.x.x"] = "1851";
  RsdDF$Year[RsdDF$Year == "y.y.y"]="1849"
}

# Pivoting n
{RnDF = subset(QRppp, select = c(Category, n.x, n.y, n.x.x, n.y.y, n.x.x.x, n.y.y.y));
RnDF <- RnDF %>%
  pivot_longer(cols=-Category, names_to = 'Year', names_prefix = 'n.', values_to = "n")
  
RnDF$Year[RnDF$Year == "x"] = "1902"; RnDF$Year[RnDF$Year == "y"] = "1891"; RnDF$Year[RnDF$Year == "n"] = "1887";
  RnDF$Year[RnDF$Year == "x.x"] = "1887"; RnDF$Year[RnDF$Year == "y.y"] = "1884"; RnDF$Year[RnDF$Year == "x.x.x"] = "1851";
  RnDF$Year[RnDF$Year == "y.y.y"] = "1849"
}


# joining long-pivoted DFs into final DF
RfDFt <- left_join(Rmmm, RsdDF, by= join_by(Category, Year))
RealfDF <- left_join(RfDFt, RnDF, by= join_by(Category, Year))
RealfDF[is.na(RealfDF)] <- 0 # Final Dataframe: "fDF"
```

``` r
# Optional code to write to xlsx file
#Write to excel file (warning: will overwrite file with same name. Make sure to change name and path) 
#write_xlsx(fDF, "D:\\Everything\\School\\RA position\\Tariff Schedules\\Analysis\\Sector Recategorization\\1902-1849 Master - Real_V2.xlsx")
```

# Graphs

### Histogram: Mean Tariffs Recategorized

``` r
reCatLabs <- c("1":"16")

ggplot(fDF , aes(x=Category, y=mean, group=Year)) + 
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") + #comment this out to remove SD bars.
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="Mean (Fr.)")+
  ggtitle("Mean Tariffs Recategorized")+ # edit graph title
  geom_text(data = fDF, aes(label = n), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph1-1.png)<!-- -->

### Scatterplot: Recategorized: Mean ~ Standard Deviation

``` r
fDF$ID <- rep(1:16, each = 6)

ggplot(fDF, x=sd, y=mean)+
  geom_point(stat="identity", aes(color=Year, x=sd, y=mean), size=2)+
  geom_smooth(aes(color= Year, x=sd, y=mean), method = "lm", alpha = .15)+
  #theme_economist()+
  theme(legend.position= "left")+
  xlim(0,50)+
  ylim(0, 50)+
  labs(x="Standard Deviation", y="Mean (Fr.)")+
  ggtitle("Recategorized: Mean ~ Standard Deviation")+
  geom_text_repel(aes(color= Year, x=sd, y=mean),
                   label=paste0(fDF$ID,"^(",fDF$n,")"),
                   parse=TRUE,
                   label.padding = unit(0.1, "lines"), # Rectangle size around label
                   label.size = 0.02,
                   force=1,
                   force_pull = 0.1
  )+
  facet_zoom(xlim = c(0, 10),
             zoom.size = 0.75,
             ylim=c(0,10))
```

![](RAship-Data-Analysis_files/figure-gfm/graph2-1.png)<!-- -->

lm(mean ~ Category, data=fDF)

## Measuring Change Over Consecutive Years

### The % change of the number of items in each category over consecutive years: \[(n\_(it)-n\_(it-1))/n\_(it-1)\]\*100

``` r
fDF <- fDF %>%
  arrange(Category, Year) %>%
  ungroup()

n_percentage_change_df <- fDF %>%
  group_by(Category) %>%
  mutate(n_Percentage_Change = (n - lag(n)) / lag(n) * 100) %>%
  mutate(n_Percentage_Change = ifelse(Year == 1849, NA, n_Percentage_Change)) %>% #setting all 1849 rows to NA to be removed later
  ungroup()

n_percentage_change_df <- na.omit(n_percentage_change_df) #removing all 1849 rows because they have no previous year to be compared to

# Histogram
ggplot(n_percentage_change_df , aes(x=Category, y=n_Percentage_Change, group=Year)) + 
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") +
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="% Change in 'n'")+
  ggtitle(TeX("Difference in Category(i) n-values over consecutive Years (t): $\\frac{(n_{it}-n_{it-1})}{n_{it-1}}\\cdot 100$"))+ # edit graph title
  geom_text(data = n_percentage_change_df, aes(label = round(n_Percentage_Change, 1)), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph3-1.png)<!-- -->

### The % change of the proportions of categories (of all items in that year) over consecutive years: \[(%n\_(it)-%n\_(it-1))/%n\_(it-1)\]\*100

``` r
# finding totals firsts
prop_df <- fDF
prop_df$Year <- as.factor(fDF$Year)

prop_df <- within(prop_df, {
  year_sum <- ave(n, Year, FUN=sum)
})

# proportional change over previous year
n_proportion_change_df <- prop_df %>%
  arrange(Category, Year) %>%
  group_by(Year) %>%
  mutate(n_Proportion = n/year_sum) %>% 
  mutate(n_prop_change = (n_Proportion - lag(n_Proportion)) / lag(n_Proportion) * 100) %>%
  mutate(n_prop_change = ifelse(Year == 1849, NA, n_prop_change)) %>% #setting all 1849 rows to NA to be removed later
  ungroup()

n_proportion_change_df <- na.omit(n_proportion_change_df) #removing all 1849 rows because they have no previous year to be compared to

# Histogram
ggplot(n_proportion_change_df, aes(x=Category, y=n_prop_change, group=Year)) +
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") +
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="% Change")+
  ggtitle(TeX("Proportional difference in Category (i) n-values over consecutive Years (t): $\\frac{(p_{it}-p_{it-1})}{p_{it-1}}\\cdot 100,\\frac{n_{it}}{\\sum_in_{i}}= p_{it}$"))+ # edit graph title
  geom_text(data = n_proportion_change_df, aes(label = round(n_prop_change, 1)), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph9-1.png)<!-- -->

### The % change in mean tariffs over consecutive years: \[(T\_(it)-T\_(it-1))/T\_(it-1)\]\*100

(make sure: are you using REAL or NOMINAL tariffs? Change ggplot text
accordingly)

``` r
fDF <- fDF %>%
  arrange(Category, Year) %>%
  ungroup()

realMean_change_df <- fDF %>%
  group_by(Category) %>%
  mutate(realMean_Percentage_Change = (mean - lag(mean)) / lag(mean) * 100) %>%
  mutate(realMean_Percentage_Change = ifelse(Year == 1849, NA, realMean_Percentage_Change)) %>% #setting all 1849 rows to NA to be removed later
  ungroup() %>%
  na.omit(realMean_change_df)

# Histogram
ggplot(realMean_change_df , aes(x=Category, y=realMean_Percentage_Change, group=Year)) + 
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") +
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="% Change in Nominal Mean Tariffs")+
  ggtitle(TeX("Difference in Nominal Mean Tariffs (NT) arranged by Category (i) over consecutive Years (t): $\\frac{(NT_{it}-NT_{it-1})}{NT_{it-1}}\\cdot 100$"))+ # edit graph title
  geom_text(data = realMean_change_df, aes(label = round(realMean_Percentage_Change, 1)), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph4-1.png)<!-- -->

### The % change in Tariff SDs over consecutive years: \[(SD\_(it)-SD\_(it-1))/SD\_(it-1)\]\*100

(make sure: are you using REAL or NOMINAL tariffs?)

``` r
fDF <- fDF %>%
  arrange(Category, Year) %>%
  ungroup()

realSD_change_df <- fDF %>%
  group_by(Category) %>%
  mutate(realSD_Percentage_Change = (sd - lag(sd)) / lag(sd) * 100) %>%
  mutate(realSD_Percentage_Change = ifelse(Year == 1849, NA, realSD_Percentage_Change)) %>% #setting all 1849 rows to NA to be removed later
  ungroup()

realSD_change_df <- na.omit(realSD_change_df)

# Histogram
ggplot(realSD_change_df , aes(x=Category, y=realSD_Percentage_Change, group=Year)) + 
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") +
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="% Change in Nominal Tariff SD")+
  ggtitle(TeX("Difference in Nominal Tariff SDs (SD) arranged by Category (i) over consecutive Years (t): $\\frac{(SD_{it}-SD_{it-1})}{SD_{it-1}}\\cdot 100$"))+ # edit graph title
  geom_text(data = realSD_change_df, aes(label = round(realSD_Percentage_Change, 1)), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph5-1.png)<!-- -->

## Measuring change over: 1849-1884 & 1884-1902

### The % change of the number of items in each category \[(n\_(it)-n\_(it-1))/n\_(it-1)\]\*100

``` r
fournine_otwo_n_percentage_change_df <- fDF %>%
  arrange(Category, Year) %>%
  group_by(Category) %>%
  mutate(row = ifelse(Year == 1851| Year == 1887| Year == 1891, NA, 1)) %>% # filtering out unwanted years
  na.omit(fournine_otwo_n_percentage_change_df) %>% #...
  select(!(row)) %>% #...
  mutate(n_Change = (n - lag(n))/ lag(n) * 100) %>% 
  mutate(n_Change = ifelse(Year == 1849, NA, n_Change))%>% #setting all 1849 rows to NA to be removed later
  na.omit(fournine_otwo_n_percentage_change_df) %>% #removing all 1849 rows because they have no previous year to be compared to
  ungroup()
  
# Histogram
ggplot(fournine_otwo_n_percentage_change_df , aes(x=Category, y=n_Change, group=Year)) + 
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") +
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="% Change in 'n'")+
  ggtitle(TeX("Difference in Category(i) n-values: 1849-1884 & 1884-1902 (t): $\\frac{(n_{it}-n_{it-1})}{n_{it-1}}\\cdot 100$"))+ # edit graph title
  geom_text(data = fournine_otwo_n_percentage_change_df, aes(label = round(n_Change, 1)), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph6-1.png)<!-- -->

### The % change of the proportions of observations per category: \[(%n\_(it)-%n\_(it-1))/%n\_(it-1)\]\*100

``` r
# finding totals first
prop_df <- fDF
prop_df$Year <- as.factor(fDF$Year)

prop_df <- within(prop_df, {
  year_sum <- ave(n, Year, FUN=sum)
})


# proportional change over previous year
fournine_otwo_n_proportion_change_df <- prop_df %>%
  arrange(Category, Year) %>%
  group_by(Category) %>%
  mutate(row = ifelse(Year == 1851| Year == 1887| Year == 1891, NA, 1)) %>%
  na.omit(fournin_otwo_n_proportion_change_df) %>%
  select(!(row)) %>%
  mutate(n_Proportion = n/year_sum) %>% 
  mutate(n_prop_change = (n_Proportion - lag(n_Proportion)) / lag(n_Proportion) * 100) %>%
  mutate(n_prop_change = ifelse(Year == 1849, NA, n_prop_change)) %>% #setting all 1849 rows to NA to be removed later
  na.omit(fournin_otwo_n_proportion_change_df) %>% #removing all 1849 rows because they have no previous year to be compared to
  ungroup()

# Histogram
ggplot(fournine_otwo_n_proportion_change_df, aes(x=Category, y=n_prop_change, group=Year)) +
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") +
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="% Change")+
  ggtitle(TeX("Proportional difference in Category (i) n-values: 1849-1884 & 1884-1902 (t): $\\frac{(p_{it}-p_{it-1})}{p_{it-1}}\\cdot 100,\\frac{n_{it}}{\\sum_in_{i}}= p_{it}$"))+ # edit graph title
  geom_text(data = fournine_otwo_n_proportion_change_df, aes(label = round(n_prop_change, 1)), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph12-1.png)<!-- -->

## The % change in mean tariffs: \[(T\_(it)-T\_(it-1))/T\_(it-1)\]\*100

(make sure: are you using REAL or NOMINAL tariffs? Change ggplot text
accordingly)

``` r
fournine_otwo_Mean_change_df <- fDF %>%
  arrange(Category, Year) %>%
  group_by(Category) %>%
  mutate(row = ifelse(Year==1851 | Year==1887 | Year==1891, NA, 1)) %>%
  na.omit(fournine_otwo_Mean_change_df) %>%
  select(!(row)) %>%
  mutate(Mean_Percentage_Change = (mean - lag(mean)) / lag(mean) * 100) %>%
  mutate(Mean_Percentage_Change = ifelse(Year == 1849, NA, Mean_Percentage_Change)) %>% #setting all 1849 rows to NA to be removed later
  ungroup() %>% 
  na.omit(fournine_otwo_Mean_change_df) #removing all 1849 rows because they have no previous year to be compared to

reCatLabs <- c("1":"16")

# Histogram
ggplot(fournine_otwo_Mean_change_df , aes(x=Category, y=Mean_Percentage_Change, group=Year)) + 
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") +
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="% Change in Real Mean Tariffs")+
  ggtitle(TeX("Difference in Real Mean Tariffs (RT) arranged by Category (i): 1849-1884 & 1884-1902 (t): $\\frac{(RT_{it}-RT_{it-1})}{RT_{it-1}}\\cdot 100$"))+ # edit graph title
  geom_text(data = fournine_otwo_Mean_change_df, aes(label = round(Mean_Percentage_Change, 1)), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph10-1.png)<!-- -->

## The % change in Tariff SDs: \[(T\_(it)-T\_(it-1))/T\_(it-1)\]\*100

(make sure: are you using REAL or NOMINAL tariffs? Change ggplot text
accordingly)

``` r
fournine_otwo_SD_change_df <- fDF %>%
  arrange(Category, Year) %>%
  group_by(Category) %>%
  mutate(row = ifelse(Year==1851 | Year==1887 | Year==1891, NA, 1)) %>%
  na.omit(fournine_otwo_SD_change_df) %>%
  select(!(row)) %>%
  mutate(SD_Percentage_Change = (sd - lag(sd)) / lag(sd) * 100) %>%
  mutate(SD_Percentage_Change = ifelse(Year == 1849, NA, SD_Percentage_Change)) %>% #setting all 1849 rows to NA to be removed later
  ungroup() %>% 
  na.omit(fournine_otwo_SD_change_df) #removing all 1849 rows because they have no previous year to be compared to


# Histogram
ggplot(fournine_otwo_SD_change_df , aes(x=Category, y=SD_Percentage_Change, group=Year)) + 
  geom_bar(stat="identity", aes(fill=Year), size=2, position="dodge")+
  #geom_errorbar(aes(fill= Year, ymin= ifelse(mean-sd < 0, 0, mean-sd), ymax=mean+sd), position= "dodge") +
  geom_point(size=2, position= position_dodge(width=0.9))+
  #theme_economist()+
  scale_x_discrete(labels=reCatLabs)+
  labs(x="", y="% Change in Real Tariff SDs ")+
  ggtitle(TeX("Difference in Real Tariff SDs (SD) arranged by Category (i): 1849-1884 & 1884-1902 (t): $\\frac{(SD_{it}-SD_{it-1})}{SD_{it-1}}\\cdot 100$"))+ # edit graph title
  geom_text(data = fournine_otwo_SD_change_df, aes(label = round(SD_Percentage_Change, 1)), 
            position = position_dodge(width = 0.9), vjust = -0.25)
```

![](RAship-Data-Analysis_files/figure-gfm/graph7-1.png)<!-- -->
