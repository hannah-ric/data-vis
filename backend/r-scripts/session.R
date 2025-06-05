# R Session Script for Data Visualization Backend
# This script maintains an interactive R session for code execution

# Set options for better error handling
options(error = function() {
  cat("ERROR:", geterrmessage(), "\n")
})

# Disable graphics devices to prevent window popups
options(device = function(...) {
  pdf(NULL)
})

# Load commonly used libraries
suppressPackageStartupMessages({
  if (require(ggplot2, quietly = TRUE)) {
    library(ggplot2)
  }
  if (require(dplyr, quietly = TRUE)) {
    library(dplyr)
  }
})

# Function to safely install and load packages
safe_library <- function(package_name) {
  if (!require(package_name, character.only = TRUE, quietly = TRUE)) {
    cat(paste("Package", package_name, "is not installed\n"))
    return(FALSE)
  }
  library(package_name, character.only = TRUE, quietly = TRUE)
  return(TRUE)
}

# Function to capture plot output as base64
capture_plot <- function(plot_code) {
  # Create temporary file
  temp_file <- tempfile(fileext = ".png")
  
  # Open PNG device
  png(temp_file, width = 800, height = 600, bg = "white")
  
  # Execute plot code
  tryCatch({
    eval(parse(text = plot_code))
  }, error = function(e) {
    dev.off()
    unlink(temp_file)
    stop(e)
  })
  
  # Close device
  dev.off()
  
  # Read and encode file
  if (file.exists(temp_file)) {
    # Read binary data
    raw_data <- readBin(temp_file, "raw", file.info(temp_file)$size)
    # Encode to base64
    base64_data <- base64enc::base64encode(raw_data)
    # Clean up
    unlink(temp_file)
    # Return data URI
    return(paste0("data:image/png;base64,", base64_data))
  }
  
  return(NULL)
}

# Signal that R is ready
cat("R_SESSION_READY\n")

# Initialize buffer for multi-line input
input_buffer <- ""
in_multiline <- FALSE

# Main loop - read and execute commands
while (TRUE) {
  # Read input line
  line <- readLines(con = stdin(), n = 1)
  
  if (length(line) == 0) {
    Sys.sleep(0.1)
    next
  }
  
  # Accumulate input
  input_buffer <- paste0(input_buffer, line, "\n")
  
  # Check if we have a complete execution block
  # Look for EXECUTION_COMPLETE marker
  if (grepl("EXECUTION_COMPLETE_", input_buffer)) {
    # Execute the accumulated code
    tryCatch({
      # Check if this might be a plotting command
      plot_keywords <- c("plot", "ggplot", "corrplot", "hist", "boxplot", "scatter")
      is_plot <- any(sapply(plot_keywords, function(kw) grepl(kw, input_buffer)))
      
      if (is_plot && require(base64enc, quietly = TRUE)) {
        # Try to capture plot
        plot_result <- tryCatch({
          # Extract just the user code (remove tryCatch wrapper)
          user_code <- gsub("tryCatch\\(\\{", "", input_buffer)
          user_code <- gsub("cat\\(.*EXECUTION_COMPLETE.*\\).*", "", user_code)
          user_code <- gsub("\\}, error = function.*", "", user_code)
          user_code <- trimws(user_code)
          
          capture_plot(user_code)
        }, error = function(e) NULL)
        
        if (!is.null(plot_result)) {
          cat(plot_result)
        }
      }
      
      # Execute normally for text output
      output <- capture.output({
        eval(parse(text = input_buffer))
      })
      
      # Print non-empty output
      if (length(output) > 0 && !all(output == "")) {
        cat(paste(output, collapse = "\n"), "\n")
      }
    }, error = function(e) {
      cat("ERROR:", conditionMessage(e), "\n")
    })
    
    # Reset buffer
    input_buffer <- ""
    
    # Flush output
    flush.console()
  }
} 